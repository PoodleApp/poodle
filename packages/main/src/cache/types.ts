import Integer from "integer"
import { HeaderValue } from "../models/Message"

export type ID = Integer.IntLike
export type SerializedHeaders = Array<[string, HeaderValue]>

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
  x_gm_msgid?: string
  x_gm_thrid?: string
}
