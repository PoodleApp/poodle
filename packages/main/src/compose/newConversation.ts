import * as cache from "../cache"
import { MessageInput } from "../generated/graphql"
import * as A from "../models/Address"
import { mkMessageId } from "./helpers"
import { ComposedMessage } from "./types"

export function composeNewConversation({
  account,
  message
}: {
  account: cache.Account
  message: MessageInput
}): ComposedMessage {
  const date = new Date()
  const messageId = mkMessageId(account.email)
  const from = [A.build({ email: account.email })]
  const to = message.to.map(a => ({ ...a, name: a.name || undefined }))
  return {
    attributes: {
      flags: ["\\Seen"],
      date: date,
      envelope: {
        date,
        subject: message.subject || null,
        from,
        sender: from,
        replyTo: from,
        to,
        cc: null,
        bcc: null,
        inReplyTo: null,
        messageId
      },
      struct: [
        {
          partID: "1",
          type: message.content.type,
          subtype: message.content.subtype,
          params: { charset: "UTF-8" }
        }
      ]
    },
    headers: [],
    bodies: { "1": Buffer.from(message.content.content, "utf8") }
  }
}
