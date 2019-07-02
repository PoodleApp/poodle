import { Seq } from "immutable"
import * as cache from "../cache"
import * as C from "../models/conversation"
import { midUri } from "../models/uri"
import { nonNull } from "../util/array"
import { mkMessageId, mkStruct } from "./helpers"
import { ComposedMessage } from "./types"

export function composeEdit({
  account,
  content,
  conversation,
  editedMessage,
  editedPart,
  resource
}: {
  account: cache.Account
  content: { type: string; subtype: string; content: string }
  conversation: { id: string; messages: cache.Message[] }
  editedMessage: { envelope_messageId: string }
  editedPart: { content_id?: string | null }
  resource: { messageId: string; contentId?: string | null }
}): ComposedMessage {
  if (!editedPart.content_id) {
    throw new Error(
      "Editing a message part with no Content-ID is not supported at this time."
    )
  }
  if (!editedMessage.envelope_messageId) {
    throw new Error("Editing a message with no Message-ID is not supported.")
  }
  const editedUri = midUri(
    editedMessage.envelope_messageId,
    editedPart.content_id
  )
  const date = new Date()
  const replyToMessage = Seq(conversation.messages).last(undefined)
  const messageId = mkMessageId(account.email)
  const subject = C.getSubject(conversation)
  const { from, to, cc, replyTo } = C.getReplyParticipants(
    conversation,
    account
  )
  return {
    attributes: {
      flags: ["\\Seen"],
      date: date,
      envelope: {
        date,
        subject: subject ? `Re: ${subject}` : null,
        from: from!,
        sender: from!,
        replyTo: replyTo ? replyTo : null,
        to: to,
        cc: cc,
        bcc: null,
        inReplyTo: replyToMessage ? replyToMessage.envelope_messageId : null,
        messageId
      },
      "x-gm-thrid": conversation.messages[0].x_gm_thrid,
      struct: mkStruct([
        {
          partID: "1",
          type: "multipart",
          subtype: "mixed",
          params: {}
        },
        [
          [
            {
              partID: "2",
              type: "text",
              subtype: "plain",
              id: mkMessageId(account.email),
              params: { charset: "UTF-8" },
              disposition: { type: "fallback" }
            },
            []
          ],
          [
            {
              partID: "3",
              type: content.type,
              subtype: content.subtype,
              id: mkMessageId(account.email),
              params: { charset: "UTF-8" },
              disposition: { type: "replacement" }
            },
            []
          ]
        ]
      ])
    },
    headers: [
      [
        "references",
        conversation.messages.map(m => m.envelope_messageId).filter(nonNull)
      ]
    ],
    partHeaders: {
      "3": [
        [
          "replaces",
          {
            value: `<${editedUri}>`,
            params: {
              resource: `<${midUri(resource.messageId, resource.contentId)}>`
            }
          }
        ]
      ]
    },
    bodies: {
      "2": Buffer.from("Edited message:", "utf8"),
      "3": Buffer.from(content.content, "utf8")
    }
  }
}
