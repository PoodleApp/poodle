import imap from "imap"
import { List, Seq } from "immutable"
import { MessageAttributes } from "../types"
import * as P from "./MessagePart"

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

/*
 * Helpers to find parts within a message
 *
 * Note that `ImapMessagePart` values contain *metadata*.
 */

export function getPartByPartId(
  partId: string,
  msg: MessageAttributes
): imap.ImapMessagePart | undefined {
  return flatParts(msg)
    .filter(part => part.partID === partId)
    .first()
}

export function inlineContentParts(
  struct: imap.ImapMessageStruct
): List<imap.ImapMessagePart> {
  return getInlineParts(part => part.type === "text", struct)
}

export function allContentParts(
  struct: imap.ImapMessageStruct
): List<imap.ImapMessagePart> {
  const f = (parts: List<imap.ImapMessagePart>, part: imap.ImapMessagePart) =>
    parts.push(part)
  const zero = List()
  return foldParts(f, zero, selectAllContent(), struct)
}

function flatParts(msg: MessageAttributes): Seq.Indexed<imap.ImapMessagePart> {
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
      // mixed: all parts are inline unless they have a `disposition` type that
      // is not `inline`
      return nestedStructs.filter(s => {
        const [part] = unpack(s)
        return !part.disposition || part.disposition.type === "inline"
      })
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

function selectAllContent(): (
  subtype: string,
  nestedStructs: imap.ImapMessageStruct[]
) => imap.ImapMessageStruct[] {
  return (_subtype, nestedStructs) => {
    return nestedStructs
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

function getInlineParts(
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
      // mixed: attachments are nested parts with a `disposition` type of
      // `attachment`
      return nestedStructs.filter(s => {
        const [part] = unpack(s)
        return part.disposition && part.disposition.type === "attachment"
      })
    } else {
      return fallbackSelector(subtype, nestedStructs)
    }
  }
  return foldParts(f, accum, selector, struct)
}

export function attachmentParts(
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

function getStruct(msg: MessageAttributes): imap.ImapMessageStruct {
  if (!msg.struct) {
    throw new Error("Message does not include `struct`")
  }
  return msg.struct
}
