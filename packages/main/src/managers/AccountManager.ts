/*
 * This poorly-named module ensures that each logged-in account is matched with
 * exactly one `ConnectionManager`
 */

import keytar from "keytar"
import { getConnectionFactory } from "../account"
import db from "../db"
import {
  OAuthCredentials,
  getAccessToken,
  client_id,
  client_secret
} from "../oauth"
import ConnectionManager from "./ConnectionManager"

type Account = { id: ID; email: string }
type ID = string

export default class AccountManager {
  static connectionManagers: Record<ID, ConnectionManager> = {}

  static async addAccount(account: Account) {
    const token = await loadAccessToken(account)
    if (token) {
      await this.addConnectionManager(account, token)
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
      })
    )
  }

  static getConnectionManager(accountId: ID): ConnectionManager | undefined {
    return this.connectionManagers[accountId]
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
    }
  }
})()

if (process.env.NODE_ENV === "test") {
  beforeEach(() => {
    AccountManager.connectionManagers = {}
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
