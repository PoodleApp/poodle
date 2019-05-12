import { List, Seq } from "immutable"
import * as cache from "../cache"
import {
  ConversationResolvers,
  ConversationMutationsResolvers,
  MutationResolvers,
  QueryResolvers
} from "../generated/graphql"
import { contentParts } from "../models/Message"
import * as queue from "../queue"
import { nonNull } from "../util/array"
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

export const ConversationMutations: ConversationMutationsResolvers = {
  async setIsRead(_parent, { id, isRead }) {
    if (!isRead) {
      throw new Error(
        "Marking a conversation as unread is not yet implemented."
      )
    }
    const thread = getConversation(id)
    if (!thread) {
      throw new Error(`Cannot find conversation with ID, ${id}`)
    }
    setIsRead(thread.messages)
    return thread
  }
}

function setIsRead(messages: cache.Message[]) {
  const grouped = Seq(messages)
    .filter(message => !cache.getFlags(message.id).includes("\\Seen"))
    .groupBy(message => List([message.account_id, message.box_id] as const))
  for (const [grouping, msgs] of grouped) {
    const accountId = grouping.get(0)
    const boxId = grouping.get(1)
    const box = boxId && cache.getBox(boxId)
    if (!accountId || !box) {
      continue
    }
    const uids = msgs.map(message => message.uid).filter(nonNull)
    if (!uids.isEmpty()) {
      queue.enqueue(
        queue.actions.markAsRead({
          accountId: String(accountId),
          box,
          uids: uids.valueSeq().toArray()
        })
      )
    }
  }
}

export const queries: Partial<QueryResolvers> = {
  conversation(_parent, { id }): types.Conversation | null {
    return getConversation(id)
  }
}

export const mutations: Partial<MutationResolvers> = {
  conversations() {
    return {}
  }
}

export function getConversation(id: string): types.Conversation | null {
  return cache.getThread(id)
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
