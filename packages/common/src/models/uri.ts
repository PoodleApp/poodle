export type URI = string

type Email = string

// TODO: normalize URIs
export function equals(x: URI, y: URI): boolean {
  return x === y
}

export function mailtoUri(email: Email): URI {
  // TODO: Should we normalize? Maybe lowercase?
  return `mailto:${email}`
}

export function midUri(messageId: string, contentId?: string | null): URI {
  const mId = idFromHeaderValue(messageId)
  const cId = contentId && idFromHeaderValue(contentId)
  return cId
    ? `mid:${encodeURIComponent(mId)}/${encodeURIComponent(cId)}`
    : `mid:${encodeURIComponent(mId)}`
}

const midExp = /(mid:|cid:)([^/]+)(?:\/(.+))?$/

export function parseMidUri(
  uri: URI
): { scheme: string; messageId?: string; contentId?: string } | undefined {
  const matches = uri.match(midExp)
  if (matches) {
    const scheme = matches[1]
    const messageId =
      scheme === "mid:" ? decodeURIComponent(matches[2]) : undefined
    const contentId =
      scheme === "cid:"
        ? decodeURIComponent(matches[2])
        : decodeURIComponent(matches[3])
    return { scheme, messageId, contentId }
  }
}

export function sameUri(x: URI | undefined, y: URI | undefined): boolean {
  // TODO: normalization
  return !!x && !!y && x === y
}

export function sameEmail(x: Email | undefined, y: Email | undefined): boolean {
  // TODO: normalization
  return !!x && !!y && x === y
}

// Use a regular expression to trim angle brackets off
const messageIdPattern = /<(.*)>/

export function idFromHeaderValue(id: string): string {
  return id.replace(messageIdPattern, (_, id) => id)
}
