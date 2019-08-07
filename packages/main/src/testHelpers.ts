// Assumes that `fn` was imported from a module mocked using
// `jest.mock(modulePath)`

import * as types from "./cache/types"
import db from "./db"

/**
 * Returns a promise that resolves after the given delay.
 * @param delay time in milliseconds (default 0)
 */
export function delay(time = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, time))
}

export function mock<F extends (...args: any[]) => any>(
  fn: F
): jest.Mock<ReturnType<F>, Parameters<F>> {
  return fn as any
}

export function testAccount(email: string): types.Account {
  const { lastInsertRowid: accountId } = db
    .prepare("insert into accounts (email) values (?)")
    .run(email)
  return { id: accountId, email }
}
