import imap from "imap"
import { List, Seq } from "immutable"
import Moment from "moment"
import Address from "./Address"
import * as P from "./MessagePart"
import { URI, midUri, parseMidUri } from "./uri"

export { parseMidUri } from "./uri"

export type MessageId = string

// native Javascript Map; this type is produced by 'mailparser'
export type Headers = Map<string, HeaderValue>
export type HeaderValue =
  | any
  | {
      html?: string
      text?: string
      value: any
      params?: { charset?: string }
    }

export default class Message {
  attributes: imap.ImapMessageAttributes
  headers: Headers
  id: MessageId
  bcc?: Address[]
  cc?: Address[]
  from?: Address[]
  inReplyTo: MessageId | null
  receivedDate: Moment.Moment
  subject?: string
  to?: Address[]

  constructor(msg: imap.ImapMessageAttributes, headers: Headers) {
    this.attributes = msg
    this.headers = headers
    // TODO: not every message has a messageId header
    this.id = idFromHeaderValue(msg.envelope.messageId)
    this.bcc = addressList(msg.envelope.bcc)
    this.cc = addressList(msg.envelope.cc)
    this.from = addressList(msg.envelope.from)
    this.inReplyTo =
      msg.envelope.inReplyTo && idFromHeaderValue(msg.envelope.inReplyTo)
    this.receivedDate = Moment(msg.date)
    this.subject = msg.envelope.subject
    this.to = addressList(msg.envelope.to)
  }

  // Request metadata for a message part by `partId` or `contentId`. Content ID
  // is assigned by the `Content-ID` header of the MIME part (which may be
  // absent). A part ID is assigned to every MIME part based on order of
  // appearance in the message.
  getPart(partRef: P.PartRef): imap.ImapMessagePart | undefined {
    switch (partRef.type) {
      case P.AMBIGUOUS_ID:
        const id = partRef.id
        return (
          getPartByContentId(id, this.attributes) ||
          getPartByPartId(id, this.attributes)
        )
      case P.CONTENT_ID:
        return getPartByContentId(partRef.contentId, this.attributes)
      case P.PART_ID:
        return getPartByPartId(partRef.partId, this.attributes)
    }
  }

  get activityParts(): List<imap.ImapMessagePart> {
    return activityParts(this.attributes)
  }

  // Returns any primary content types, following all branches under
  // `multipart/alternative` parts
  get allContentParts(): List<imap.ImapMessagePart> {
    return allContentParts(getStruct(this.attributes))
  }

  // Assume that the first value in the references list is the first message in
  // the thread
  get conversationId(): MessageId {
    return this.references.concat(this.id)[0]
  }

  get htmlParts(): List<imap.ImapMessagePart> {
    return htmlParts(this.attributes)
  }

  get parts(): imap.ImapMessagePart[] {
    return flatParts(this.attributes).toArray()
  }

  get textParts(): List<imap.ImapMessagePart> {
    return textParts(this.attributes)
  }

  get attachmentParts(): List<imap.ImapMessagePart> {
    return attachmentParts(this.attributes)
  }

  get references(): MessageId[] {
    const val = getHeaderValue("references", this.headers)
    const refs = typeof val === "string" ? val.split(/\s+/) : val
    return refs.map(idFromHeaderValue).filter(id => !!id)
  }

  get uid(): number {
    return this.attributes.uid
  }

  get uri(): URI {
    return midUri(this.id)
  }

  uriForPart(part: imap.ImapMessagePart): URI {
    // `ImapMessagePart` contains `partID` and `id` properties. The `id`
    // property contains the specified content ID for the part, but may not be
    // present.  It looks like `partID` is assigned based on the order of parts
    // in the message.
    //
    // It is very useful for our purposes to have a URI for *every* message
    // part. So we are going to fall back to using the `partID` for the content
    // ID part of the URI for parts that do not have `Content-ID` headers. Note
    // that this is not in conformance with RFC-2392! This could lead to
    // ambiguity in any cose where a `Content-ID` contains only numbers or
    // numbers and dots. TODO!
    const contentId = part.id ? part.id : part.partID
    if (!contentId) {
      throw new Error("cannot compute URI for a message part with no ID")
    }
    return this.uriForContentId(contentId)
  }

  // TODO
  uriForContentId(contentId: string): URI {
    return midUri(this.id, contentId)
  }

  uriForPartRef(partRef: P.PartRef): URI {
    let id
    switch (partRef.type) {
      case P.AMBIGUOUS_ID:
        id = partRef.id
        break
      case P.CONTENT_ID:
        id = partRef.contentId
        break
      case P.PART_ID:
        id = partRef.partId
        break
    }
    return midUri(this.id, id)
  }

  // If the given URI has the `cid:` scheme, then it is relative to some message,
  // and does not specify a message ID in the URI itself. In that case, this
  // function returns a fully-qualified `mid:` URI that refers to the same message
  // part. If the given URI has the `mid:` scheme then this function returns the
  // URI unmodified.
  resolveUri(uri: URI): URI {
    const parsed = parseMidUri(uri)
    if (parsed) {
      const { scheme, contentId } = parsed
      if (scheme === "cid:" && contentId) {
        return this.uriForContentId(contentId)
      }
    }
    return uri
  }
}

/*
 * Helpers to find parts within a message
 *
 * Note that `ImapMessagePart` values contain *metadata*.
 */

export function getPartByPartId(
  partId: string,
  msg: imap.ImapMessageAttributes
): imap.ImapMessagePart | undefined {
  return flatParts(msg)
    .filter(part => part.partID === partId)
    .first()
}

function getPartByContentId(
  contentId: string,
  msg: imap.ImapMessageAttributes
): imap.ImapMessagePart | undefined {
  return flatParts(msg)
    .filter(part => part.id && idFromHeaderValue(part.id) === contentId)
    .first()
}

export function contentParts(
  struct: imap.ImapMessageStruct
): List<imap.ImapMessagePart> {
  return getPrimaryParts(part => part.type === "text", struct)
}

function textParts(
  msg: imap.ImapMessageAttributes
): List<imap.ImapMessagePart> {
  const textFilter = ({ type, subtype }: imap.ImapMessagePart) =>
    type === "text" && subtype === "plain"
  return getPrimaryParts(textFilter, getStruct(msg))
}

function htmlParts(
  msg: imap.ImapMessageAttributes
): List<imap.ImapMessagePart> {
  const htmlFilter = ({ type, subtype }: imap.ImapMessagePart) =>
    type === "text" && subtype === "html"
  return getPrimaryParts(htmlFilter, getStruct(msg))
}

function activityParts(
  msg: imap.ImapMessageAttributes
): List<imap.ImapMessagePart> {
  const actFilter = ({ type, subtype }: imap.ImapMessagePart) =>
    type === "application" && subtype === "activity+json"
  return getPrimaryParts(actFilter, getStruct(msg))
}

// Follows all branches under `multipart/alternative` parts
function allContentParts(
  struct: imap.ImapMessageStruct
): List<imap.ImapMessagePart> {
  function f(
    parts: List<imap.ImapMessagePart>,
    part: imap.ImapMessagePart,
    nestedStructs: imap.ImapMessageStruct[]
  ) {
    if (part.subtype) {
      // not a multipart type
      return parts.push(part)
    }
    if (part.type === "alternative") {
      return parts.concat(Seq(nestedStructs).flatMap(allContentParts))
    } else {
      return parts
    }
  }
  const zero = List()
  const filter = (_: imap.ImapMessagePart) => false // Do not descend into `alternative` parts
  return foldPrimaryContent(f, zero, filter, struct)
}

function flatParts(
  msg: imap.ImapMessageAttributes
): Seq.Indexed<imap.ImapMessagePart> {
  return rec(getStruct(msg))

  function rec(
    struct: imap.ImapMessageStruct
  ): Seq.Indexed<imap.ImapMessagePart> {
    const [part, nestedStructs] = unpack(struct)

    if (P.isMultipart(part)) {
      return Seq(nestedStructs).flatMap(rec)
    } else {
      return Seq([part])
    }
  }
}

// Traverse MIME tree, using a `selectSubtrees` callback to choose which
// subtrees to traverse
function foldParts<T>(
  f: (
    accum: T,
    part: imap.ImapMessagePart,
    nestedStructs: imap.ImapMessageStruct[]
  ) => T,
  accum: T,
  selectSubtrees: (
    subtype: string,
    nestedStructs: imap.ImapMessageStruct[]
  ) => imap.ImapMessageStruct[],
  struct: imap.ImapMessageStruct
): T {
  const [part, nestedStructs] = unpack(struct)
  const result = f(accum, part, nestedStructs)

  // Not sure if it is a client library issue: in multipart types I'm seeing the
  // multipart as the `type` property, with no value for `subtype`. In other
  // part types `type` and `subtype` are assigned as I expect.
  const subtype = part.subtype || part.type

  if (nestedStructs.length === 0) {
    return result
  }
  return selectSubtrees(subtype, nestedStructs).reduce(
    (acc, str) => foldParts(f, acc, selectSubtrees, str),
    result
  )
}

// A subtree selector for use with `foldParts`
function selectPrimaryContent(
  filter: (_: imap.ImapMessagePart) => boolean // Determines which part to pick in an `alternative`
): (
  subtype: string,
  nestedStructs: imap.ImapMessageStruct[]
) => imap.ImapMessageStruct[] {
  return (subtype, nestedStructs) => {
    if (subtype === "mixed") {
      // mixed: the first part is primary, the remaining parts are attachments
      return nestedStructs.slice(0, 1)
    } else if (subtype === "alternative") {
      // alternative: recurse into the last part that matches the filter, or that
      // is an ancestor of a part that matches the predicate
      // Look ahead to find to try to find a part in each subtree that matches the
      // filter.
      const matchingStructs = nestedStructs.filter(struct =>
        foldParts(
          (accum, part) => accum || filter(part),
          false as boolean,
          selectPrimaryContent(filter),
          struct
        )
      )
      // Identify the last nested struct that contains a part that matches the
      // filter.
      return matchingStructs.slice(-1)
    } else if (subtype === "related") {
      // related: the first part is primary, the remaining parts are referenced by
      // the primary content (e.g., inline images)
      return nestedStructs.slice(0, 1)
    } else if (subtype.indexOf("signed") > -1) {
      // signed: the first part is the primary content (which is signed);
      // there should be another part, which should be the signature
      // TODO: verify signatures
      return nestedStructs.slice(0, 1)
    } else {
      // TODO: What to do when encountering unknown multipart subtype?
      throw new Error(
        `Encountered unknown multipart subtype: multipart/${subtype}`
      )
    }
  }
}

// The email spec has rules about which MIME parts in a MIME hierarchy represent
// content to be displayed as message content, as opposed to attachments,
// supporting content that may be referred to by the primary content,
// cryptographic signatures, etc. This function traverses primary content,
// accumulating some result value.
function foldPrimaryContent<T>(
  f: (
    accum: T,
    part: imap.ImapMessagePart,
    nestedStructs: imap.ImapMessageStruct[]
  ) => T,
  accum: T,
  filter: (_: imap.ImapMessagePart) => boolean, // Determines which part to pick in an `alternative`
  struct: imap.ImapMessageStruct
): T {
  return foldParts(f, accum, selectPrimaryContent(filter), struct)
}

function getPrimaryParts(
  filter: (_: imap.ImapMessagePart) => boolean, // Determines which part to pick in an `alternative`
  struct: imap.ImapMessageStruct
): List<imap.ImapMessagePart> {
  const f = (parts: List<imap.ImapMessagePart>, part: imap.ImapMessagePart) =>
    filter(part) ? parts.push(part) : parts
  const zero = List()
  return foldPrimaryContent(f, zero, filter, struct)
}

// TODO: I think this will get the primary content part if the message contains
// exactly one part (i.e., no multipart parts)
function foldAttachmentParts<T>(
  f: (
    accum: T,
    part: imap.ImapMessagePart,
    nestedStructs: imap.ImapMessageStruct[]
  ) => T,
  accum: T,
  filter: (_: imap.ImapMessagePart) => boolean, // Determines which part to pick in an `alternative`
  struct: imap.ImapMessageStruct
): T {
  const fallbackSelector = selectPrimaryContent(filter)
  function selector(
    subtype: string,
    nestedStructs: imap.ImapMessageStruct[]
  ): imap.ImapMessageStruct[] {
    if (subtype === "mixed") {
      // mixed: the first part is primary, the remaining parts are attachments
      return nestedStructs.slice(1)
    } else {
      return fallbackSelector(subtype, nestedStructs)
    }
  }
  return foldParts(f, accum, selector, struct)
}

function attachmentParts(
  msg: imap.ImapMessageAttributes
): List<imap.ImapMessagePart> {
  const f = (parts: List<imap.ImapMessagePart>, part: imap.ImapMessagePart) =>
    !P.isMultipart(part) ? parts.push(part) : parts
  const filter = (_: imap.ImapMessagePart) => true
  const zero = List()
  return foldAttachmentParts(f, zero, filter, getStruct(msg))
}

/* More user-friendly access to `ImapMessageStruct` values */

function unpack(
  struct: imap.ImapMessageStruct
): [imap.ImapMessagePart, imap.ImapMessageStruct[]] {
  return [struct[0] as any, struct.slice(1) as any]
}

// Use a regular expression to trim angle brackets off
const messageIdPattern = /<(.*)>/

export function idFromHeaderValue(id: MessageId): MessageId {
  return id.replace(messageIdPattern, (_, id) => id)
}

function addressList(
  addrs: imap.Address[] | null | undefined
): Address[] | undefined {
  if (addrs) {
    return addrs.map(a => new Address(a))
  }
}

function getHeaderValue(key: string, headers: Headers): string | string[] {
  return normalizeHeaderValue(headers.get(key))
}

// TODO: fix up types here
function normalizeHeaderValue(v: any): any {
  if (!v) {
    return []
  }
  if (typeof v === "string") {
    return v
  }
  if (v instanceof Array) {
    return v.filter(e => typeof e === "string")
  }
  if (v.value) {
    return normalizeHeaderValue(v.value)
  }
}

function getStruct(msg: imap.ImapMessageAttributes): imap.ImapMessageStruct {
  if (!msg.struct) {
    throw new Error("Message does not include `struct`")
  }
  return msg.struct
}
