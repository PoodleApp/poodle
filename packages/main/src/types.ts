import { default as Connection, default as imap } from "imap"
import { Omit } from "./util/types"

export type AccountMetadata = {
  email: Email
  capabilities: string[]
}

export type ConnectionFactory = (
  config?: Partial<Connection.Config>
) => Promise<Connection>

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
