import imap from "imap"
import { parseOneAddress } from "email-addresses"
import uuid from "node-uuid"

export function mkMessageId(senderEmail: string): string {
  const parsed = parseOneAddress(senderEmail)
  const address = "addresses" in parsed ? parsed.addresses[0] : parsed
  return `<${uuid.v4()}@${address.domain}>`
}

type Part = imap.ImapMessagePart
type Struct = [Part, NestedStructs]
interface NestedStructs extends Array<Struct> {}

export function mkStruct([part, children]: Struct): imap.ImapMessageStruct {
  return [part, ...children.map(mkStruct)]
}
