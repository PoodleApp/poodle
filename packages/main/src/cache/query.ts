import imap from "imap"
import db from "../db"
import { ID, Message } from "./types"

export function firstSeenUid(accountId: ID, box: { name: string }): number {
  const boxRecord = getBoxRecord(accountId, box)
  if (!boxRecord) {
    return 0
  }
  const result: { max_uid: number | null } = db
    .prepare(
      `
        select min(uid) as max_uid from messages
        where box_id = ?
      `
    )
    .get(boxRecord.id)
  return result.max_uid || 0
}

export function lastSeenUid(accountId: ID, box: { name: string }): number {
  const boxRecord = getBoxRecord(accountId, box)
  if (!boxRecord) {
    return 0
  }
  const result: { max_uid: number | null } = db
    .prepare(
      `
        select max(uid) as max_uid from messages
        where box_id = ?
      `
    )
    .get(boxRecord.id)
  return result.max_uid || 0
}

function getBoxRecord(accountId: ID, box: { name: string }): { id: ID } | null {
  return db
    .prepare(
      `
        select id from boxes
        where
          account_id = @account_id and
          name = @name
      `
    )
    .get({ account_id: accountId, name: box.name })
}

export function getBox(boxId: ID): { id: ID; name: string } | null {
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
  const messages = db
    .prepare(
      `
        select * from messages
        where x_gm_thrid = ?
        order by date
      `
    )
    .all(threadId)
  return { id: threadId, messages }
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

export function getParticipants(
  messageId: ID,
  type: string
): Array<{ host: string; mailbox: string; name: string | null }> {
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

export function getBody(
  messageId: ID,
  { partID }: imap.ImapMessagePart
): Buffer | null {
  const result = db
    .prepare(
      `
      select content from message_bodies as bodies
      join message_structs as structs on message_struct_id = structs.id
      where
        message_id = @messageId and
        part_id = @partID
    `
    )
    .get({ messageId, partID })
  return result && result.content
}

export function partsMissingBodies({
  accountId,
  boxId,
  minUid = 0,
  maxUid = 0
}: {
  accountId: ID
  boxId: ID
  minUid?: number
  maxUid?: number
}): Array<{ uid: number; boxName: string; part: imap.ImapMessagePart }> {
  return db
    .prepare(
      `
        select uid, structs.*
        from message_structs as structs
        join messages
          on message_id = messages.id
        left outer join message_bodies as bodies
          on message_struct_id = structs.id
        where
          box_id = @boxId
          and messages.account_id = @accountId
          and bodies.content is null
          and structs.rgt = structs.lft + 1
          and messages.uid >= @minUid
          and (@maxUid <= 0 or messages.uid <= @maxUid)
      `
    )
    .all({ accountId, boxId, minUid, maxUid })
    .map(row => ({
      uid: row.uid,
      boxName: row.boxName,
      part: toImapMessagePart(row)
    }))
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
