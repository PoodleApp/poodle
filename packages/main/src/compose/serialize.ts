import MimeNode, { DataSource } from "buildmail"
import imap from "imap"
import { SerializedHeaders } from "../cache"
import { formatAddressList } from "../models/Address"
import { HeaderValue } from "../models/Message"
import * as P from "../models/MessagePart"
import { MessageAttributes } from "../types"

export function serialize({
  attributes,
  headers,
  bodies
}: {
  attributes: MessageAttributes
  headers: SerializedHeaders
  bodies: Record<string, Buffer> | ((partId: string) => DataSource | undefined)
}): MimeNode {
  const getBody =
    typeof bodies === "function" ? bodies : (partId: string) => bodies[partId]
  const [rootPart, ...children] = attributes.struct!
  const message = serializeNode(
    rootPart as imap.ImapMessagePart,
    children,
    getBody
  )
  message.date = new Date(attributes.date)
  const { messageId, from, to, cc, inReplyTo, subject } = attributes.envelope
  const setHeaders: Record<string, string | null | undefined> = {
    "message-id": messageId,
    from: from && formatAddressList(from),
    to: to && formatAddressList(to),
    cc: cc && formatAddressList(cc),
    subject,
    "in-reply-to": inReplyTo
  }
  for (const [key, value] of Object.entries(setHeaders)) {
    if (value) {
      message.setHeader(key, value)
    }
  }
  for (const [key, value] of headers) {
    const processed = processHeaderValue(value)
    if (processed) {
      message.addHeader(key, processed)
    }
  }
  return message
}

function serializeNode(
  part: imap.ImapMessagePart,
  children: imap.ImapMessageStruct,
  getBody: (partId: string) => DataSource | undefined
): MimeNode {
  const dispParams = (part.disposition && part.disposition.params) || {}
  const node = new MimeNode(P.contentType(part), {
    disableFileAccess: true,
    disableUrlAccess: true,
    filename: dispParams.filename
  })
  const content = part.partID && getBody(part.partID)
  const headers: Record<string, string | null | undefined> = {
    "content-description": part.description,
    "content-disposition": P.disposition(part),
    "content-id": part.id,
    "content-md5": part.md5,
    "content-language": part.language,
    "content-length": Buffer.isBuffer(content)
      ? String(content.byteLength)
      : undefined,
    "content-location": part.location,
    "content-transfer-encoding": part.encoding
  }
  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      node.setHeader(key, value)
    }
  }
  if (content) {
    node.setContent(content)
  }
  for (const child of children) {
    const [childPart, ...grandChildren] = child as imap.ImapMessageStruct
    node.appendChild(
      serializeNode(childPart as imap.ImapMessagePart, grandChildren, getBody)
    )
  }
  return node
}

function processHeaderValue(value: HeaderValue): string | undefined {
  const v = value && value.value ? value.value : value
  if (Array.isArray(v)) {
    return v.join(" ")
  }
  return v
}
