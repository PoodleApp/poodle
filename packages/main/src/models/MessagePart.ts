import imap from "imap"

export type MessagePart = imap.ImapMessagePart

export const AMBIGUOUS_ID = "ambiguousId"
export const CONTENT_ID = "contentId"
export const PART_ID = "partId"

export type PartRef =
  | { type: typeof AMBIGUOUS_ID; id: string }
  | { type: typeof CONTENT_ID; contentId: string }
  | { type: typeof PART_ID; partId: string }

// Some message parts do not have content IDs. (content IDs are explicit headers
// on parts, part IDs are assigned to content parts in order when parsing
// a message). In cases with no content ID we fall back to part IDs for `mid:`
// URIs (in contradiction of RFC-2392). Unfortunately that means that when we
// parse a `mid` URI we do not know whether the result is a content ID or a part
// ID. The ambiguous ID type encodes a ref for those cases. In general an
// ambiguous ID will result in a lookup by content ID first, and then by part ID
// in case the content ID lookup fails.
export function ambiguousId(id: string): PartRef {
  return { type: AMBIGUOUS_ID, id }
}

export function contentId(id: string): PartRef {
  if (id.startsWith("<")) {
    // TODO
    throw new Error("Remove angle brackets from contentId!")
  }
  return { type: CONTENT_ID, contentId: id }
}

export function partId(id: string): PartRef {
  return { type: PART_ID, partId: id }
}

export function charset(part: MessagePart): string | undefined {
  return part.params && part.params.charset
}

export function contentType(part: MessagePart): string {
  if (!part.type) {
    throw new Error("cannot determine content type of part")
  }
  if (!part.subtype) {
    // TODO: My observations so far indicate that if there is no value for
    // `subtype`, then the type is `multipart`, and the value given for `type`
    // is actually the subtype.
    return `multipart/${part.type}`
  }

  const baseType = `${part.type}/${part.subtype}`
  const cs = charset(part)
  return cs ? `${baseType}; charset=${cs}` : baseType
}

export function disposition(part: MessagePart): string | undefined {
  return part.disposition ? part.disposition.type : undefined
}

export function filename(part: MessagePart): string | undefined {
  const params = part.disposition && part.disposition.params
  if (params) {
    return params.filename
  }
}

export function getRef(part: MessagePart): PartRef {
  if (part.id) {
    return contentId(part.id)
  } else if (part.partID) {
    return partId(part.partID)
  } else {
    throw new Error("Cannot get ref for part with no ID")
  }
}

// `node-imap` gives multipart parts where `type` is set to the subtype, and
// `subtype` is not set
export function isMultipart(part: MessagePart): boolean {
  return part.type === "multipart" || !part.subtype
}
