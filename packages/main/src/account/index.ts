import * as google from "../oauth/google"
import { SmtpConfig } from "../smtp"
import { ConnectionFactory } from "../types"
import { ImapAccount } from "./types"
import * as types from "./types"

export * from "./types"

export async function getConnectionFactory(
  account: ImapAccount
): Promise<ConnectionFactory> {
  switch (account.type) {
    case types.GOOGLE:
      return google.getConnectionFactory(account)
    default:
      throw new Error(`Unknown account type: ${account.type}`)
  }
}

export async function getSmtpConfig(account: ImapAccount): Promise<SmtpConfig> {
  switch (account.type) {
    case types.GOOGLE:
      return google.getSmtpConfig(account)
    default:
      throw new Error(`Unknown account type: ${account.type}`)
  }
}
