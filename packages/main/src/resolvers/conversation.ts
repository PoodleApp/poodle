import { convert } from "encoding"
import * as htmlToText from "html-to-text"
import { List, Seq } from "immutable"
import replyParser from "node-email-reply-parser"
import * as cache from "../cache"
import { composeReply } from "../compose"
import {
  ConversationResolvers,
  ConversationMutationsResolvers,
  MutationResolvers,
  QueryResolvers
} from "../generated/graphql"
import * as C from "../models/conversation"
import { contentParts } from "../models/Message"
import { actions, schedule } from "../queue"
import { nonNull } from "../util/array"
import * as types from "./types"

export const Conversation: ConversationResolvers = {
  date(conversation: C.Conversation) {
    return lastUpdated(conversation)
  },

  from({ messages }: C.Conversation) {
    const latest = messages[messages.length - 1]
    return cache.getParticipants(latest.id, "from")[0]
  },

  labels({ messages }: C.Conversation) {
    return Seq(messages)
      .flatMap(message => cache.getLabels(message.id))
      .toSet()
      .toArray()
      .sort()
  },

  presentableElements({ messages }: C.Conversation) {
    return messages.map(message => ({
      id: String(message.id),
      contents: getContentParts(message).toArray(),
      date: message.date,
      from: cache.getParticipants(message.id, "from")[0]
    }))
  },

  isRead({ messages }: C.Conversation) {
    return messages.every(message =>
      cache.getFlags(message.id).includes("\\Seen")
    )
  },

  snippet({ messages }: C.Conversation) {
    const latest = messages[messages.length - 1]
    const content = getContentParts(latest).first(null)
    const visible = content && replyParser(content.content, true)
    const plainText =
      visible && content && content.subtype === "html"
        ? htmlToText.fromString(visible, {
            ignoreHref: true,
            ignoreImage: true
          })
        : visible
    return plainText && plainText.slice(0, 1024)
  },

  subject(conversation: C.Conversation) {
    return C.getSubject(conversation) || null
  }
}

export const ConversationMutations: ConversationMutationsResolvers = {
  async archive(_parent, { id }) {
    const thread = mustGetConversation(id)
    updateAction(thread.messages, (accountId, box, uids) => {
      schedule(
        actions.archive({
          accountId: String(accountId),
          box,
          uids
        })
      )
    })
    return thread
  },

  async reply(_parent, { accountId, id, content }) {
    const account = cache.getAccount(accountId)
    const conversation = mustGetConversation(id)
    if (!account) {
      throw new Error(`Could not find account with ID, ${accountId}`)
    }
    schedule(
      actions.sendMessage({
        accountId,
        message: composeReply({ account, content, conversation })
      })
    )
    return mustGetConversation(id)
  },

  async setIsRead(_parent, { id, isRead }) {
    const thread = mustGetConversation(id)
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
      schedule(
        actions.markAsRead({
          accountId: String(accountId),
          box,
          uids
        })
      )
    } else {
      schedule(
        actions.unmarkAsRead({
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
  conversation(_parent, { id }): C.Conversation | null {
    return getConversation(id)
  }
}

export const mutations: Partial<MutationResolvers> = {
  conversations(_parent, params) {
    return params
  }
}

export function getConversation(id: string): C.Conversation | null {
  return cache.getThread(id)
}

function mustGetConversation(id: string): C.Conversation {
  const conversation = getConversation(id)
  if (!conversation) {
    throw new Error(`Cannot find conversation with ID, ${id}`)
  }
  return conversation
}

export function getConversations(
  account: types.Account,
  { label }: { label?: string | null }
): C.Conversation[] {
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
function lastUpdated({ messages }: C.Conversation): string {
  const latest = messages[messages.length - 1]
  return latest.date
}

function getContentParts(
  message: cache.Message
): List<{ type: string; subtype: string; content: string }> {
  return contentParts(cache.getStruct(message.id)).map(part => {
    const content = cache.getBody(message.id, part)
    const charset = part.params.charset
    const decoded =
      content && (charset ? convert(content, "utf8", charset) : content)
    return decoded
      ? {
          type: part.type || "text",
          subtype: part.subtype || "plain",
          content: decoded.toString("utf8")
        }
      : fallbackContent()
  })
}

function fallbackContent() {
  return {
    type: "text",
    subtype: "plain",
    content: "[content missing]"
  }
}
