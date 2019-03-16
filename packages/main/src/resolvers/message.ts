import * as cache from "../cache"
import { MessageResolvers } from "../generated/graphql"
import * as types from "./types"

export const Message: MessageResolvers = {
  from(message: types.Message) {
    return cache.getParticipants(message.id, "from")
  }
}

export function fromCache(msg: cache.Message): types.Message {
  return {
    id: String(msg.id),
    date: msg.date,
    inReplyTo: msg.envelope_inReplyTo,
    messageId: msg.envelope_messageId,
    subject: msg.envelope_subject
  }
}
