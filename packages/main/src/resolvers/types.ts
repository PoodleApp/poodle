import { Message as MessageRecord } from "../cache"

export interface Account {
  id: string
  email: string
}

export type AccountMutations = {}

export interface Conversation {
  id: string
  messages: MessageRecord[]
}

export interface Message {
  id: string
  date: string
  inReplyTo?: string
  messageId: string
  subject?: string
}

export type OauthCredentials = {
  access_token: string
  token_type: string // "Bearer"
  expires_in: number // seconds
  id_token: string
  refresh_token: string
}
