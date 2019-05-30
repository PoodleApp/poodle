import imap from "imap"
import db from "../db"
import { MessageAttributes } from "../types"
import { ID, SerializedHeaders } from "./types"

export function persistBoxState(accountId: ID, box: imap.Box): ID {
  return db.transaction(() => {
    const existing = db
      .prepare(
        "select * from boxes where account_id = @account_id and name = @name"
      )
      .get({ account_id: accountId, name: box.name })
    if (existing && existing.uidvalidity === box.uidvalidity) {
      db.prepare("update boxes set uidnext = @uidnext where id = @id").run({
        id: existing.id,
        uidnext: box.uidnext
      })
      return existing.id
    } else {
      return insertInto("boxes", {
        account_id: accountId,
        name: box.name,
        uidvalidity: box.uidvalidity,
        uidnext: box.uidnext
      })
    }
  })()
}

export function saveUidLastSeen({ boxId, uid }: { boxId: ID; uid: number }) {
  db.prepare("update boxes set uidlastseen = @uid where id = @boxId").run({
    boxId,
    uid
  })
}

const participantTypes = [
  "bcc",
  "cc",
  "from",
  "replyTo",
  "sender",
  "to"
] as const

export function persistAttributes(
  {
    accountId,
    boxId,
    updatedAt
  }: { accountId: ID; boxId?: ID; updatedAt?: string },
  attributes: MessageAttributes
): ID {
  return db.transaction(() => {
    const existing: { id: ID } | null = db
      .prepare(
        `
          select id from messages
          where
            box_id = @boxId and
            uid is not null and
            uid = @uid
        `
      )
      .get({ boxId, uid: attributes.uid })
    if (existing) {
      persistMessageUpdates(existing.id, attributes, updatedAt)
      return existing.id
    } else {
      return persistNewMessage({ accountId, boxId }, attributes, updatedAt)
    }
  })()
}

function persistNewMessage(
  { accountId, boxId }: { accountId: ID; boxId?: ID },
  attributes: MessageAttributes,
  updatedAt: string | undefined
): ID {
  const messageId = insertInto("messages", {
    account_id: accountId,
    box_id: boxId,
    date: attributes.date.toISOString(),
    envelope_date:
      attributes.envelope.date && attributes.envelope.date.toISOString(),
    envelope_inReplyTo: attributes.envelope.inReplyTo,
    envelope_messageId: attributes.envelope.messageId,
    envelope_subject: attributes.envelope.subject,
    modseq: attributes.modseq,
    uid: attributes.uid,
    updated_at: updatedAt,
    x_gm_msgid: attributes["x-gm-msgid"],
    x_gm_thrid: attributes["x-gm-thrid"]
  })
  for (const type of participantTypes) {
    persistParticipants(type, messageId, attributes.envelope[type])
  }
  for (const flag of attributes.flags) {
    insertInto("message_flags", { message_id: messageId, flag })
  }
  for (const label of attributes["x-gm-labels"] || []) {
    insertInto("message_gmail_labels", { message_id: messageId, label })
  }

  if (!attributes.struct) {
    throw new Error("Message does not include `struct`")
  }
  persistStruct(messageId, attributes.struct)
  return messageId
}

function persistMessageUpdates(
  messageId: ID,
  attributes: MessageAttributes,
  updatedAt: string | undefined
) {
  db.prepare("delete from message_flags where message_id = ?").run(messageId)
  db.prepare("delete from message_gmail_labels where message_id = ?").run(
    messageId
  )
  for (const flag of attributes.flags) {
    insertInto("message_flags", { message_id: messageId, flag })
  }
  for (const label of attributes["x-gm-labels"] || []) {
    insertInto("message_gmail_labels", { message_id: messageId, label })
  }
  db.prepare(
    "update messages set updated_at = @updatedAt where id = @messageId"
  ).run({ messageId, updatedAt })
}

function persistParticipants(
  type: string,
  messageId: ID,
  participants: imap.Address[] | null
) {
  for (const { host, mailbox, name } of participants || []) {
    insertInto("message_participants", {
      message_id: messageId,
      type,
      host,
      mailbox,
      name
    })
  }
}

function persistStruct(
  messageId: ID,
  structs: imap.ImapMessageStruct,
  lft: number = 1
): number {
  const part: imap.ImapMessagePart = structs[0] as any
  const children: imap.ImapMessageStruct[] = structs.slice(1) as any
  const disp_params = part.disposition && part.disposition.params

  const rgt = children.reduce(
    (r, struct) => persistStruct(messageId, struct, r) + 1,
    lft + 1
  )

  // If the content type is `multipart/*` the IMAP data actually gives the
  // subtype  the type, and the subtype field is not defined.
  const { type, subtype } = part.subtype
    ? { type: part.type, subtype: part.subtype }
    : { type: "multipart", subtype: part.type }

  insertInto("message_structs", {
    message_id: messageId,
    lft,
    rgt,
    content_id: part.id,
    description: part.description,
    disposition_filename: disp_params && disp_params.filename,
    disposition_name: disp_params && disp_params.name,
    disposition_type: part.disposition && part.disposition.type,
    encoding: part.encoding,
    md5: part.md5,
    params_charset: part.params ? part.params.charset : null,
    part_id: part.partID,
    size: part.size,
    subtype,
    type
  })

  return rgt
}

export function persistHeadersAndReferences(
  messageId: ID,
  headers: SerializedHeaders,
  attributes: MessageAttributes
) {
  return db.transaction(() => {
    const { c: existingHeaders } = db
      .prepare("select count(1) as c from message_headers where message_id = ?")
      .get(messageId)
    const { c: existingReferences } = db
      .prepare(
        "select count(1) as c from message_references where message_id = ?"
      )
      .get(messageId)
    if (!existingReferences) {
      persistReferences(messageId, headers, attributes)
    }
    if (!existingHeaders) {
      persistHeaders(messageId, headers)
    }
  })()
}

function persistReferences(
  messageId: ID,
  headers: SerializedHeaders,
  attributes: MessageAttributes
) {
  const referencesHeader = headers.find(([key, _]) => key === "references")
  if (referencesHeader) {
    const value: string | string[] = referencesHeader[1]
    const references = Array.isArray(value) ? value : [value]
    for (const reference of references) {
      insertInto("message_references", {
        message_id: messageId,
        referenced_id: reference
      })
    }
  }
  if (attributes.envelope.messageId) {
    insertInto("message_references", {
      message_id: messageId,
      referenced_id: attributes.envelope.messageId
    })
  }
}

function persistHeaders(messageId: ID, headers: SerializedHeaders) {
  for (const [key, value] of headers) {
    insertInto("message_headers", {
      message_id: messageId,
      key,
      value: JSON.stringify(value)
    })
  }
}

export function removeMessage(messageId: ID) {
  db.prepare("delete from messages where id = ?").run(messageId)
}

export function removeStaleMessages(boxId: ID, updatedAt: string) {
  db.prepare(
    `
      delete from messages
      where
        box_id = @boxId
        and updated_at <> @updatedAt
    `
  ).run({ boxId, updatedAt })
}

export function persistBody(
  messageId: ID,
  part: imap.ImapMessagePart,
  content: Buffer
) {
  const result: { id: ID } | null = db
    .prepare(
      `
      select id from message_structs
      where message_id = @messageId and part_id = @partId
    `
    )
    .get({ messageId, partId: part.partID })
  if (!result) {
    throw new Error("message part not found in struct")
  }
  insertInto("message_bodies", { message_struct_id: result.id, content })
}

// TODO: What is the proper way to provide a list of values in a query?
export function addFlag({
  accountId,
  box,
  uids,
  flag
}: {
  accountId: ID
  box: { name: string }
  uids: number[]
  flag: string
}) {
  db.prepare(
    `
      insert or ignore into message_flags (message_id, flag)
      select messages.id, @flag from messages
      join boxes on box_id = boxes.id
      where
        messages.account_id = @accountId
        and boxes.name = @boxName
        and messages.uid in (${uids.join(", ")})
    `
  ).run({ accountId, boxName: box.name, flag })
}

// TODO: What is the proper way to provide a list of values in a query?
export function delFlags({
  accountId,
  box,
  uids,
  flags
}: {
  accountId: ID
  box: { name: string }
  uids: number[]
  flags: string[]
}) {
  db.prepare(
    `
      delete from message_flags
      where
        message_id in (
          select messages.id from messages
          join boxes on box_id = boxes.id
          where
            messages.account_id = @accountId
            and boxes.name = @boxName
            and uid in (${uids.join(", ")})
        )
        and flag in (${flags.map(f => `'${f}'`).join(", ")})
    `
  ).run({ accountId, boxName: box.name })
}

// TODO: What is the proper way to provide a list of values in a query?
export function delLabels({
  accountId,
  box,
  uids,
  labels
}: {
  accountId: ID
  box: { name: string }
  uids: number[]
  labels: string[]
}) {
  db.prepare(
    `
      delete from message_gmail_labels
      where
        message_id in (
          select messages.id from messages
          join boxes on box_id = boxes.id
          where
            messages.account_id = @accountId
            and boxes.name = @boxName
            and uid in (${uids.join(", ")})
        )
        and label in (${labels.map(f => `'${f}'`).join(", ")})
    `
  ).run({ accountId, boxName: box.name })
}

function insertInto(table: string, values: Record<string, unknown>): ID {
  const keys = Object.keys(values)
  const { lastInsertRowid } = db
    .prepare(
      `
        insert into ${table}
        (${keys.join(", ")}) values
        (${keys.map(k => `@${k}`).join(", ")})
      `
    )
    .run(values)
  return lastInsertRowid
}
