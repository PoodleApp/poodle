import * as cache from "../cache"

export type Account = cache.Account

export function mustGetAccount(id: cache.ID | string): Account {
  const account = cache.getAccount(id)
  if (!account) {
    throw new Error(`Could not find account with ID, ${id}`)
  }
  return account
}
