import { BrowserWindow } from "electron"
import * as google from "./google"
import { OAuthCredentials } from "./types"

export * from "./types"

export const client_id =
  "550977579314-ot07bt4ljs7pqenefen7c26nr80e492p.apps.googleusercontent.com"
export const client_secret = "ltQpgi6ce3VbWgxCXzCgKEEG"

export const scopes = [
  "email", // get user's email address
  "https://mail.google.com/", // IMAP and SMTP access
  "https://www.googleapis.com/auth/contacts.readonly" // contacts, read-only
]

export function getAccessToken(email: string): Promise<OAuthCredentials> {
  return google.getAccessToken(openWindow as any, {
    // TODO
    scopes,
    client_id,
    client_secret,
    login_hint: email
  })
}

function openWindow() {
  return new BrowserWindow({
    title: "Authenticate with your email provider",
    useContentSize: true
  })
}
