import Connection from "imap"
import * as cache from "../cache"
import { inbox, testThread } from "../cache/testFixtures"
import db from "../db"
import AccountManager from "../managers/AccountManager"
import { mockConnection } from "../request/testHelpers"
import { sync } from "../sync"
import * as queue from "./index"

jest.mock("imap")

let accountId: cache.ID

beforeEach(async () => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid

  const connectionManager = mockConnection({
    thread: [
      {
        attributes: { ...testThread[0].attributes, flags: ["\\Answered"] },
        headers: testThread[0].headers
      },
      {
        attributes: { ...testThread[1].attributes, flags: [] },
        headers: testThread[1].headers
      }
    ]
  })

  AccountManager.connectionManagers[String(accountId)] = connectionManager

  await sync(accountId, connectionManager)
})

it("marks a conversation as read", async () => {
  const promise = queue
    .enqueue(
      queue.actions.markAsRead({
        accountId: String(accountId),
        box: inbox,
        uids: [7687]
      })
    )
    .toPromise()
  const flags = db
    .prepare(
      `
        select flag from message_flags
        join messages on message_id = messages.id
        where
          uid = @uid
      `
    )
    .all({ uid: 7687 })
  expect(flags).toEqual([{ flag: "\\Seen" }])
  await promise
  expect(Connection.prototype.addFlags).toHaveBeenCalledWith(
    [7687],
    ["\\Seen"],
    expect.any(Function)
  )
})

it("marks a conversation as unread", async () => {
  const connectionManager = mockConnection()
  await sync(accountId, connectionManager)

  const promise = queue
    .enqueue(
      queue.actions.unmarkAsRead({
        accountId: String(accountId),
        box: inbox,
        uids: [7687]
      })
    )
    .toPromise()
  const flags = db
    .prepare(
      `
        select flag from message_flags
        join messages on message_id = messages.id
        where
          uid = @uid
      `
    )
    .all({ uid: 7687 })
  expect(flags).toEqual([])
  await promise
  expect(Connection.prototype.delFlags).toHaveBeenCalledWith(
    [7687],
    ["\\Seen"],
    expect.any(Function)
  )
})

it.skip("replaces pending read status change when a new change is queued", async () => {
  // pause queue
  const connectionManager = AccountManager.connectionManagers[String(accountId)]
  delete AccountManager.connectionManagers[String(accountId)]

  const promise1 = queue
    .enqueue(
      queue.actions.markAsRead({
        accountId: String(accountId),
        box: inbox,
        uids: [7687]
      })
    )
    .toPromise()
  const promise2 = queue
    .enqueue(
      queue.actions.unmarkAsRead({
        accountId: String(accountId),
        box: inbox,
        uids: [7687]
      })
    )
    .toPromise()

  // resume queue
  AccountManager.connectionManagers[String(accountId)] = connectionManager

  queue.queue.resume()
  const flags = db
    .prepare(
      `
        select flag from message_flags
        join messages on message_id = messages.id
        where
          uid = @uid
      `
    )
    .all({ uid: 7687 })
  expect(flags).toEqual([])
  await Promise.all([promise1, promise2])
  expect(Connection.prototype.addFlags).not.toHaveBeenCalled()
})

afterEach(() => {
  db.prepare("delete from accounts").run()
})
