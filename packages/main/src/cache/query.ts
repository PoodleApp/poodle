import imap from "imap"
import { Collection } from "immutable"
import db from "../db"
import { nonNull } from "../util/array"
import { Account, Box, ID, Message, MessagePart } from "./types"

export function lastSeenUid({ boxId }: { boxId: ID }): number {
  const result = db
    .prepare("select uidlastseen from boxes where id = ?")
    .get(boxId)
  return result ? result.uidlastseen : 0
}

export function getCachedUids({
  accountId,
  max
}: {
  accountId: ID
  max: number
}): number[] {
  return db
    .prepare(
      `
        select uid from messages
        where account_id = :accountId and uid <= :max
        order by uid
      `
    )
    .all({ accountId, max })
    .map(row => row.uid)
}

export function getAccount(accountId: ID | string): Account | null {
  return db.prepare("select * from accounts where id = ?").get(accountId)
}

export function getBox(boxId: ID): Box | null {
  return db
    .prepare(
      `
        select id, name from boxes where id = ?
      `
    )
    .get(boxId)
}

interface Thread {
  id: string
  messages: Message[]
}

export function getThreads(accountId: ID): Thread[] {
  const threadIds: { x_gm_thrid: string }[] = db
    .prepare("select distinct x_gm_thrid from messages where account_id = ?")
    .all(accountId)
  return threadIds
    .map(({ x_gm_thrid }) => getThread(x_gm_thrid))
    .filter(<T>(m: T | null): m is T => Boolean(m))
}

export function getThread(threadId: string): Thread | null {
  const messagesByThrid = db
    .prepare(
      `
        select * from messages
        where x_gm_thrid = ?
        group by envelope_messageId
        order by date
      `
    )
    .all(threadId)
  if (messagesByThrid.length > 0) {
    return { id: threadId, messages: messagesByThrid }
  }

  const messagesByMessageId = db
    .prepare(
      `
        select * from messages
        where id in (
          select message_id from message_references
          where referenced_id = ?
        )
        group by envelope_messageId
        order by date
      `
    )
    .all(threadId)
  if (messagesByMessageId.length > 0) {
    return { id: threadId, messages: messagesByMessageId }
  }

  return null
}

export function getThreadByMessage(message: Message): Thread {
  const thread = message.x_gm_thrid && getThread(message.x_gm_thrid)
  return thread || { id: "", messages: [message] }
}

export function getMessages(accountId: ID): Message[] {
  return db
    .prepare(
      `
        select * from messages where account_id = ?
      `
    )
    .all(accountId)
}

export function getMessage(messageId: ID): Message | null {
  return db
    .prepare(
      `
        select * from messages where id = ?
      `
    )
    .get(messageId)
}

export function getParticipants(
  messageId: ID,
  type: string
): Array<{ host: string; mailbox: string; name?: string }> {
  return db
    .prepare(
      `
      select host, mailbox, name
      from message_participants
      where message_id = @messageId and type = @type
    `
    )
    .all({ messageId, type })
}

export function getFlags(messageId: ID): string[] {
  return db
    .prepare("select flag from message_flags where message_id = ?")
    .all(messageId)
    .map(({ flag }) => flag)
}

export function getLabels(messageId: ID): string[] {
  return db
    .prepare("select label from message_gmail_labels where message_id = ?")
    .all(messageId)
    .map(({ label }) => label)
}

interface CachedMessagePart {
  id: ID
  message_id: ID
  lft: number
  rgt: number
  content_id?: string
  description?: string
  disposition_filename?: string
  disposition_name?: string
  disposition_type?: string
  encoding?: string
  md5?: string
  params_charset: string
  part_id?: string
  size: number
  subtype: string
  type: string
}

export function getStruct(messageId: ID): imap.ImapMessageStruct {
  const parts: CachedMessagePart[] = db
    .prepare(
      `
      select * from message_structs
      where message_id = ?
      order by lft
    `
    )
    .all(messageId)

  function go(
    parts: CachedMessagePart[]
  ): { tree: imap.ImapMessageStruct; rest: CachedMessagePart[] } {
    const root = parts[0]
    const subtrees: imap.ImapMessageStruct[] = []
    let [nested, notNested] = partition(
      ({ lft, rgt }) => root.lft < lft && rgt < root.rgt,
      parts.slice(1)
    )
    while (nested.length > 0) {
      const { tree, rest } = go(nested)
      subtrees.push(tree)
      nested = rest
    }
    return { tree: [toImapMessagePart(root), ...subtrees], rest: notNested }
  }

  return go(parts).tree
}

export function getMessagePart(id: ID): MessagePart | null {
  return db
    .prepare(
      `
        select * from message_structs where id = ?
      `
    )
    .get(id)
}

export function getEditsFromMessage(
  messageId: ID
): Array<MessagePart & { replaces: string }> {
  return db
    .prepare(
      `
      select *, headers.value as replaces from message_structs
      join message_part_headers as headers
        on message_struct_id = message_structs.id
      where message_id = ? and headers.key = 'replaces'
    `
    )
    .all(messageId)
}

export function getBody(
  messageId: ID,
  part: { partID?: string } | { part_id?: string }
): Buffer | null {
  const partId =
    "partID" in part
      ? part.partID
      : "part_id" in part
      ? part.part_id
      : undefined
  if (!partId) {
    throw new Error("cannot retrieve a part body without a part ID")
  }
  const result = db
    .prepare(
      `
      select content from message_bodies as bodies
      join message_structs as structs on message_struct_id = structs.id
      where
        message_id = @messageId and
        part_id = @partId
    `
    )
    .get({ messageId, partId })
  return result && result.content
}

export function getPartByPartId(params: {
  messageId: ID
  partId: string
}): MessagePart | null {
  return db
    .prepare(
      `
        select * from message_structs
        where message_id = @messageId and part_id = @partId
      `
    )
    .get(params)
}

export function getSyncToken(accountId: ID) {
  return db
    .prepare("select Google_API_syncToken from accounts where id = @accountId")
    .get({ accountId }).Google_API_syncToken
}

/**
 * Look up a message part by RFC message ID and content ID
 *
 * @param params
 * @param params.messageId Value from `Message-ID` header of message
 * @param params.contentId Value from `Content-ID` header of part
 */
export function getPartByContentId(params: {
  messageId: string
  contentId?: string | null
}): MessagePart | null {
  if (!params.contentId) {
    return null
  }
  return db
    .prepare(
      `
        select * from message_structs
        join messages on message_id = messages.id
        where envelope_messageId = @messageId and content_id = @contentId
      `
    )
    .get(params)
}

export function partsMissingBodies({
  accountId,
  boxId,
  uids
}: {
  accountId: ID
  boxId: ID
  uids?: Collection.Indexed<number>
}): Array<{ uid: number; boxName: string; part: imap.ImapMessagePart }> {
  return db
    .prepare(
      `
        select uid, structs.*
        from message_structs as structs
        join messages
          on message_id = messages.id
        left outer join message_bodies as bodies
          on bodies.message_struct_id = structs.id
        left outer join message_part_headers as headers
          on headers.message_struct_id = structs.id
        where
          box_id = @boxId
          and messages.account_id = @accountId
          and (bodies.content is null or headers.key is null)
          and structs.rgt = structs.lft + 1
          ${uids ? `and messages.uid in (${uids.join(", ")})` : ""}
      `
    )
    .all({ accountId, boxId })
    .map(row => ({
      uid: row.uid,
      boxName: row.boxName,
      part: toImapMessagePart(row)
    }))
}

export function missingMessageIds(accountId: ID): string[] {
  return db
    .prepare(
      `
        select referenced_id from message_references as refs
        left outer join messages as referenced
          on referenced.envelope_messageId = refs.referenced_id
        join messages
          on messages.id = refs.message_id
        where messages.account_id = ? and referenced.id is null
      `
    )
    .all(accountId)
    .map(row => row.referenced_id)
}

export function searchBySubject(query: string): Thread[] {
  const threadIds = db
    .prepare(
      `
        select x_gm_thrid as thrid from messages
        join message_subject_index on message_subject_index.rowid = messages.id
        where message_subject_index match ?
        group by x_gm_thrid
        order by rank
      `
    )
    .all(ftsEscape(query))
    .map(row => row.thrid)
  return threadIds.map(getThread).filter(nonNull)
}

function ftsEscape(query: string): string {
  return `"${query}"`
}

function toImapMessagePart(part: CachedMessagePart): imap.ImapMessagePart {
  const dispositionParams: Record<string, string> = {}
  if (part.disposition_filename) {
    dispositionParams.filename = part.disposition_filename
  }
  if (part.disposition_name) {
    dispositionParams.name = part.disposition_name
  }

  const disposition: imap.ImapMessagePart["disposition"] = part.disposition_type
    ? {
        type: part.disposition_type,
        params: dispositionParams
      }
    : null

  return {
    partID: part.part_id,
    type: part.type,
    subtype: part.subtype,
    params: part.params_charset ? { charset: part.params_charset } : {},
    encoding: part.encoding,
    id: part.content_id,
    description: part.description,
    disposition,
    md5: part.md5,
    size: part.size
  }
}

function partition<T>(p: (x: T) => boolean, xs: T[]): [T[], T[]] {
  const match: T[] = []
  const noMatch: T[] = []
  for (const x of xs) {
    if (p(x)) {
      match.push(x)
    } else {
      noMatch.push(x)
    }
  }
  return [match, noMatch]
}
