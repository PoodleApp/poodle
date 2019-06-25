/*
 * This poorly-named module ensures that each logged-in account is matched with
 * exactly one `ConnectionManager` and one SMTP `Transporter`.
 */

import keytar from "keytar"
import mailer, { Transporter } from "nodemailer"
import { getConnectionFactory, getSmtpConfig } from "../account"
import db from "../db"
import {
  OAuthCredentials,
  getAccessToken,
  client_id,
  client_secret
} from "../oauth"
import { actions, schedule } from "../queue"
import ConnectionManager from "./ConnectionManager"

type Account = { id: ID; email: string }
type ID = string

export default class AccountManager {
  static connectionManagers: Record<ID, ConnectionManager> = {}
  static smtpTransporters: Record<ID, Transporter> = {}

  static async addAccount(account: Account) {
    const token = await loadAccessToken(account)
    if (token) {
      await Promise.all([
        this.addConnectionManager(account, token),
        this.addSmtpTransporter(account, token)
      ])
    }
  }

  static async authenticate(account: Account) {
    const credentials = await getAccessToken(account.email)
    await this.addConnectionManager(account, credentials)
    storeAccessToken(account, credentials)
  }

  static async addConnectionManager(
    account: Account,
    credentials: OAuthCredentials
  ) {
    this.connectionManagers[account.id] = new ConnectionManager(
      await getConnectionFactory({
        type: "google",
        email: account.email,
        client_id,
        client_secret,
        credentials
      }),
      {
        keepalive: true,
        onConnect() {
          schedule(actions.sync({ accountId: account.id }))
        },
        onUpdates() {
          schedule(actions.sync({ accountId: account.id }))
        }
      }
    )
  }

  static getConnectionManager(accountId: ID): ConnectionManager | undefined {
    return this.connectionManagers[accountId]
  }

  static deleteConnectionManager(accountId: ID) {
    const connection = this.getConnectionManager(accountId)
    connection && connection.closeConn()

    delete this.connectionManagers[accountId]
  }

  static async addSmtpTransporter(
    account: Account,
    credentials: OAuthCredentials
  ) {
    const smtpConfig = await getSmtpConfig({
      type: "google",
      email: account.email,
      client_id,
      client_secret,
      credentials
    })
    this.smtpTransporters[account.id] = mailer.createTransport(smtpConfig)
  }

  static getSmtpTransporter(accountId: ID): Transporter | undefined {
    return this.smtpTransporters[accountId]
  }

  static isLoggedIn(accountId: ID): boolean {
    return accountId in this.connectionManagers
  }
}

;(async function init() {
  for (const account of getAccounts()) {
    const token = await loadAccessToken(account)
    if (token) {
      AccountManager.addConnectionManager(account, token)
      AccountManager.addSmtpTransporter(account, token)
    }
  }
})()

if (process.env.NODE_ENV === "test") {
  beforeEach(() => {
    AccountManager.connectionManagers = {}
    AccountManager.smtpTransporters = {}
  })
}

function getAccounts(): Account[] {
  return db.prepare("select id, email from accounts").all()
}

// Attempt to load access token from OS keychain
async function loadAccessToken(
  account: Account
): Promise<OAuthCredentials | undefined> {
  const json = await keytar.getPassword("Poodle", account.email)
  const creds = json && JSON.parse(json)
  if (creds && creds.refresh_token) {
    return creds
  }
}

async function storeAccessToken(account: Account, token: OAuthCredentials) {
  keytar.setPassword("Poodle", account.email, JSON.stringify(token))
}
