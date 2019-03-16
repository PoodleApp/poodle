import keytar from "keytar"
import { getConnectionFactory } from "../account"
import * as cache from "../cache"
import db from "../db"
import {
  AccountResolvers,
  AccountMutationsResolvers,
  MutationResolvers,
  QueryResolvers
} from "../generated/graphql"
import ConnectionManager from "../managers/ConnectionManager"
import {
  OAuthCredentials,
  getAccessToken,
  client_id,
  client_secret
} from "../oauth"
import { sync } from "../sync"
import * as conversation from "./conversation"
import * as message from "./message"
import * as types from "./types"

type ID = string

let connectionManagers: Record<ID, ConnectionManager> = {}
;(async function init() {
  for (const account of getAccounts()) {
    const token = await loadAccessToken(account)
    if (token) {
      initConnectionManager(account, token)
    }
  }
})()

if (process.env.NODE_ENV === "test") {
  beforeEach(() => {
    connectionManagers = {}
  })
}

export const Account: AccountResolvers = {
  loggedIn(account: types.Account) {
    return account.id in connectionManagers
  },

  conversations(account: types.Account) {
    return conversation.getConversations(account)
  },

  messages(account: types.Account): types.Message[] {
    return cache.getMessages(account.id).map(message.fromCache)
  }
}

export const queries: Partial<QueryResolvers> = {
  async account(_parent, { id }): Promise<types.Account | null> {
    return getAccount(id)
  },

  accounts() {
    return db.prepare("select * from accounts").all()
  }
}

export const AccountMutations: AccountMutationsResolvers = {
  async create(_parent, { email }) {
    const stmt = db.prepare("insert into accounts (email) values (?)")
    const { lastInsertRowid: accountId } = stmt.run(email)
    const account = getAccount(accountId)
    const token = await loadAccessToken(account)
    if (token) {
      await initConnectionManager(account, token)
    }
    return { id: String(accountId), email }
  },

  async authenticate(_parent, { id }) {
    const account = getAccount(id)
    const credentials = await getAccessToken(account.email)
    await initConnectionManager(account, credentials)
    storeAccessToken(account, credentials)
    return account
  },

  async sync(_parent, { id }) {
    const account = getAccount(id)
    const connectionManager = connectionManagers[id]
    if (!connectionManager) {
      throw new Error(`error syncing: account is not logged in, ${id}`)
    }
    await sync(id, connectionManager)
    return account
  }
}

export const mutations: Partial<MutationResolvers> = {
  accounts() {
    return {}
  }
}

function getAccount(id: ID | cache.ID): types.Account {
  const account = db.prepare("select * from accounts where id = ?").get(id)
  if (!account) {
    throw new Error(
      `error authenticating: could not find account with ID ${id}`
    )
  }
  return account
}

function getAccounts(): types.Account[] {
  return db.prepare("select * from accounts").all()
}

// Attempt to load access token from OS keychain
async function loadAccessToken(
  account: types.Account
): Promise<OAuthCredentials | undefined> {
  const json = await keytar.getPassword("Poodle", account.email)
  const creds = json && JSON.parse(json)
  if (creds && creds.refresh_token) {
    return creds
  }
}

async function storeAccessToken(
  account: types.Account,
  token: OAuthCredentials
) {
  keytar.setPassword("Poodle", account.email, JSON.stringify(token))
}

async function initConnectionManager(
  account: types.Account,
  credentials: OAuthCredentials
) {
  connectionManagers[account.id] = new ConnectionManager(
    await getConnectionFactory({
      type: "google",
      email: account.email,
      client_id,
      client_secret,
      credentials
    })
  )
}
