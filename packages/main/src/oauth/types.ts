export const GOOGLE = "google"

export type GoogleAccount = {
  type: typeof GOOGLE
  email: string
  client_id: string
  client_secret: string
  credentials: OAuthCredentials
}

export type OAuthCredentials = {
  access_token: string
  token_type: string // "Bearer"
  expires_in: number // seconds
  id_token: string
  refresh_token: string
}
