import Integer from "integer"
import { HeaderValue } from "../models/Message"

export type ID = Integer.IntLike
export type SerializedHeaders = Array<[string, HeaderValue]>

export interface Account {
  id: ID
  email: string
}

export interface Box {
  id: ID
  name: string
}

export interface Message {
  id: ID
  account_id: ID
  box_id?: ID
  date: string
  envelope_date?: string
  envelope_inReplyTo?: string
  envelope_messageId: string
  envelope_subject?: string
  modseq?: string
  uid?: number
  updated_at?: string
  x_gm_msgid?: string
  x_gm_thrid?: string
}

export interface MessagePart {
  id: ID
  message_id: ID
  content_id?: string
  description?: string
  disposition_filename?: string
  disposition_name?: string
  disposition_type?: string
  encoding?: string
  md5?: string
  params_charset?: string
  part_id?: string
  size?: number
  subtype: string
  type: string
}

export interface Search {
  id: ID
  account_id: ID
  box_id: ID
  query: string
  uidlastseen?: number
}

export interface Thread {
  id: string
  messages: Message[]
}
