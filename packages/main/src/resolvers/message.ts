import * as cache from "../cache"
import { MessageResolvers } from "../generated/graphql"
import * as C from "../models/conversation"
import * as types from "./types"

export const Message: MessageResolvers = {
  from(message: types.Message) {
    return cache.getParticipants(message.id, "from")
  },

  presentables(message: types.Message) {
    return C.getPresentableElements({ messages: [message] }).toArray()
  }
}

export function fromCache(msg: cache.Message): types.Message {
  return {
    ...msg,
    id: String(msg.id),
    inReplyTo: msg.envelope_inReplyTo,
    messageId: msg.envelope_messageId,
    subject: msg.envelope_subject
  }
}
