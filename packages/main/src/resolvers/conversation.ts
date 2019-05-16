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

  labels({ messages }) {
    return Seq(messages)
      .flatMap(message => cache.getLabels(message.id))
      .toSet()
      .toArray()
      .sort()
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
  async archive(_parent, { id }) {
    const thread = getConversation(id)
    if (!thread) {
      throw new Error(`Cannot find conversation with ID, ${id}`)
    }
    updateAction(thread.messages, (accountId, box, uids) => {
      queue.enqueue(
        queue.actions.archive({
          accountId: String(accountId),
          box,
          uids
        })
      )
    })
    return thread
  },

  async setIsRead(_parent, { id, isRead }) {
    const thread = getConversation(id)
    if (!thread) {
      throw new Error(`Cannot find conversation with ID, ${id}`)
    }
    setIsRead(thread.messages, isRead)
    return thread
  }
}

function setIsRead(messages: cache.Message[], isRead: boolean) {
  const filtered = messages.filter(message => {
    const seen = cache.getFlags(message.id).includes("\\Seen")
    return isRead ? !seen : seen
  })
  updateAction(filtered, (accountId, box, uids) => {
    if (isRead) {
      queue.enqueue(
        queue.actions.markAsRead({
          accountId: String(accountId),
          box,
          uids
        })
      )
    } else {
      queue.enqueue(
        queue.actions.unmarkAsRead({
          accountId: String(accountId),
          box,
          uids
        })
      )
    }
  })
}

function updateAction(
  messages: cache.Message[],
  fn: (accountId: cache.ID, box: cache.Box, uids: number[]) => void
) {
  const grouped = Seq(messages).groupBy(message =>
    List([message.account_id, message.box_id] as const)
  )
  for (const [grouping, msgs] of grouped) {
    const accountId = grouping.get(0)
    const boxId = grouping.get(1)
    const box = boxId && cache.getBox(boxId)
    if (!accountId || !box) {
      continue
    }
    const uids = msgs.map(message => message.uid).filter(nonNull)
    if (!uids.isEmpty()) {
      fn(accountId, box, uids.valueSeq().toArray())
    }
  }
}

export const queries: Partial<QueryResolvers> = {
  conversation(_parent, { id }): types.Conversation | null {
    return getConversation(id)
  }
}

export const mutations: Partial<MutationResolvers> = {
  conversations(_parent, params) {
    return params
  }
}

export function getConversation(id: string): types.Conversation | null {
  return cache.getThread(id)
}

export function getConversations(
  account: types.Account,
  { label }: { label?: string | null }
): types.Conversation[] {
  return Seq(cache.getThreads(account.id))
    .filter(({ messages }) =>
      label
        ? messages.some(message => cache.getLabels(message.id).includes(label))
        : true
    )
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
