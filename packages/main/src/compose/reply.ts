import { Seq } from "immutable"
import * as cache from "../cache"
import * as C from "../models/conversation"
import { nonNull } from "../util/array"
import { mkMessageId } from "./helpers"
import { ComposedMessage } from "./types"

export function composeReply({
  account,
  content,
  conversation
}: {
  account: cache.Account
  content: { type: string; subtype: string; content: string }
  conversation: { id: string; messages: cache.Message[] }
}): ComposedMessage {
  const date = new Date()
  const replyToMessage = Seq(conversation.messages).last(undefined)
  const messageId = mkMessageId(account.email)
  const subject = C.getSubject(conversation)
  const { from, to, cc } = C.getReplyParticipants(conversation, account)
  return {
    attributes: {
      flags: ["\\Seen"],
      date: date,
      envelope: {
        date,
        subject: subject ? `Re: ${subject}` : null,
        from: from.toArray(),
        sender: from.toArray(),
        replyTo: from.toArray(),
        to: to.toArray(),
        cc: cc.toArray(),
        bcc: null,
        inReplyTo: replyToMessage ? replyToMessage.envelope_messageId : null,
        messageId
      },
      "x-gm-thrid": conversation.messages[0].x_gm_thrid,
      struct: [
        {
          partID: "1",
          type: content.type,
          subtype: content.subtype,
          params: { charset: "UTF-8" }
        }
      ]
    },
    headers: [
      [
        "references",
        conversation.messages.map(m => m.envelope_messageId).filter(nonNull)
      ]
    ],
    bodies: { "1": Buffer.from(content.content, "utf8") }
  }
}
