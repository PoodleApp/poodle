import imap from "imap"
import { Omit } from "./util/types"

export type AccountMetadata = {
  email: Email
  capabilities: string[]
}

export type Email = string

// Messages generated locally (messages queued to send, drafts) will not have
// a uid or modseq.
export type MessageAttributes = Omit<
  imap.ImapMessageAttributes,
  "uid" | "modseq"
> & {
  uid?: number
  modseq?: string
}

export type ThreadId = string
