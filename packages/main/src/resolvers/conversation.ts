import { Seq } from "immutable"
import * as cache from "../cache"
import { ConversationResolvers, QueryResolvers } from "../generated/graphql"
import { contentParts } from "../models/Message"
import * as types from "./types"

export const Conversation: ConversationResolvers = {
  date(conversation: types.Conversation) {
    return lastUpdated(conversation)
  },

  from({ messages }: types.Conversation) {
    const latest = messages[messages.length - 1]
    return cache.getParticipants(latest.id, "from")[0]
  },

  presentableElements({ messages }: types.Conversation) {
    return messages.map(message => ({
      id: String(message.id),
      contents: contentParts(cache.getStruct(message.id))
        .map(part => {
          const content = cache.getBody(message.id, part)
          return content
            ? {
                type: part.type || "text",
                subtype: part.subtype || "plain",
                content: content.toString(part.params.charset || "utf8")
              }
            : fallbackContent()
        })
        .toArray(),
      date: message.date,
      from: cache.getParticipants(message.id, "from")[0]
    }))
  },

  isRead({ messages }: types.Conversation) {
    return messages.every(message =>
      cache.getFlags(message.id).includes("\\Seen")
    )
  },

  subject({ messages }: types.Conversation) {
    const earliest = messages[0]
    return earliest.envelope_subject || null
  }
}

export const queries: Partial<QueryResolvers> = {
  conversation(_parent, { id }): types.Conversation | null {
    return cache.getThread(id)
  }
}

export function getConversations(account: types.Account): types.Conversation[] {
  return Seq(cache.getThreads(account.id))
    .sortBy(lastUpdated)
    .reverse()
    .toArray()
}

// Returns the date of the latest message
function lastUpdated({ messages }: types.Conversation): string {
  const latest = messages[messages.length - 1]
  return latest.date
}

function fallbackContent() {
  return {
    type: "text",
    subtype: "plain",
    content: "[content missing]"
  }
}
