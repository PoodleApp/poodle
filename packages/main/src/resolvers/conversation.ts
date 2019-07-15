import * as htmlToText from "html-to-text"
import { List, Seq } from "immutable"
import replyParser from "node-email-reply-parser"
import * as cache from "../cache"
import { composeEdit, composeNewConversation, composeReply } from "../compose"
import {
  ConversationMutationsResolvers,
  ConversationResolvers,
  ConversationSearchResult,
  MutationResolvers,
  QueryResolvers
} from "../generated/graphql"
import { mustGetAccount } from "../models/account"
import * as C from "../models/conversation"
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

  messageId({ messages }: C.Conversation) {
    const message = messages.find(msg => Boolean(msg.envelope_messageId))
    return message ? message.envelope_messageId : null
  },

  presentableElements(conversation: C.Conversation) {
    return C.getPresentableElements(conversation).toArray()
  },

  isRead({ messages }: C.Conversation) {
    return messages.every(message =>
      cache.getFlags(message.id).includes("\\Seen")
    )
  },

  isStarred({ messages }: C.Conversation) {
    return messages.some(message =>
      cache.getFlags(message.id).includes("\\Flagged")
    )
  },

  replyRecipients(conversation: C.Conversation, { fromAccountId }) {
    const account = mustGetAccount(fromAccountId)
    const recipients = C.getReplyParticipants(conversation, account)
    return recipients
  },

  snippet(conversation: C.Conversation) {
    const presentables = C.getPresentableElements(conversation)
    const latest = presentables.last(null)
    const content = latest && Seq(latest.contents).first(null)
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
    const thread = C.mustGetConversation(id)
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

  async flag(_parent, { id }) {
    const thread = C.mustGetConversation(id)
    updateAction(thread.messages, (accountId, box, uids) => {
      schedule(
        actions.flag({
          accountId: String(accountId),
          box,
          uids
        })
      )
    })
    return C.mustGetConversation(id)
  },

  async unFlag(_parent, { id }) {
    const thread = C.mustGetConversation(id)
    updateAction(thread.messages, (accountId, box, uids) => {
      schedule(
        actions.unFlag({
          accountId: String(accountId),
          box,
          uids
        })
      )
    })
    return C.mustGetConversation(id)
  },

  async edit(
    _parent,
    { accountId, conversationId, resource, revision, content }
  ) {
    const account = mustGetAccount(accountId)
    const conversation = C.mustGetConversation(conversationId)
    const editedPart = cache.getPartByContentId(revision)
    const editedMessage = editedPart && cache.getMessage(editedPart.message_id)
    if (!editedPart || !editedMessage) {
      throw new Error("error locating message to edit")
    }
    schedule(
      actions.sendMessage({
        accountId,
        message: composeEdit({
          account,
          content,
          conversation,
          editedMessage,
          editedPart,
          resource
        })
      })
    )
    return C.mustGetConversation(conversationId)
  },

  async reply(_parent, { accountId, id, content }) {
    const account = mustGetAccount(accountId)
    const conversation = C.mustGetConversation(id)
    schedule(
      actions.sendMessage({
        accountId,
        message: composeReply({ account, content, conversation })
      })
    )
    return C.mustGetConversation(id)
  },

  async setIsRead(_parent, { id, isRead }) {
    const thread = C.mustGetConversation(id)
    setIsRead(thread.messages, isRead)
    return thread
  },

  sendMessage(_parent, { accountId, message }) {
    const account = mustGetAccount(accountId)
    const composed = composeNewConversation({ account, message })
    const messageId = composed.attributes.envelope.messageId
    schedule(
      actions.sendMessage({
        accountId,
        message: composed
      })
    )
    const thread = cache.getThread(messageId)
    if (!thread) {
      throw new Error("Error saving new message")
    }
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

/**
 * Groups messages by account and box as a convenience for dispatching IMAP
 * requests.
 */
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

const tokenPattern = /^\S+\s+/

export const queries: Partial<QueryResolvers> = {
  conversation(_parent, { id }): C.Conversation | null {
    return C.getConversation(id)
  },

  conversations(_parent, { query, specificityThreshold }) {
    // The given query string might partially overlap a conversation subject if
    // we are trying to provide suggestions as the user types. This code
    // searches for successively smaller portions of the query until getting
    // down to a single query, or to a point where there are too many results.
    function go(q: string): ConversationSearchResult[] {
      const results = cache.searchBySubject(q)
      if (specificityThreshold && results.length > specificityThreshold) {
        return []
      }
      if (results.length > 0) {
        return results.map(conversation => ({
          conversation,
          query: q
        }))
      }
      const nextQ = q.replace(tokenPattern, "")
      return nextQ === q ? [] : go(nextQ)
    }
    return go(query)
  }
}

export const mutations: Partial<MutationResolvers> = {
  conversations(_parent, params) {
    return params
  }
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
