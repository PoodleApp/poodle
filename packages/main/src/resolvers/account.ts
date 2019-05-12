import * as cache from "../cache"
import db from "../db"
import {
  AccountResolvers,
  AccountMutationsResolvers,
  MutationResolvers,
  QueryResolvers
} from "../generated/graphql"
import AccountManager from "../managers/AccountManager"
import { sync } from "../sync"
import * as conversation from "./conversation"
import * as message from "./message"
import * as types from "./types"

type ID = string

export const Account: AccountResolvers = {
  loggedIn(account: types.Account) {
    return AccountManager.isLoggedIn(account.id)
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
    await AccountManager.addAccount(account)
    return { id: String(accountId), email }
  },

  async authenticate(_parent, { id }) {
    const account = getAccount(id)
    await AccountManager.authenticate(account)
    return account
  },

  async sync(_parent, { id }) {
    const account = getAccount(id)
    const connectionManager = AccountManager.getConnectionManager(id)
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
