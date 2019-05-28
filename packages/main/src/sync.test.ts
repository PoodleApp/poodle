import Connection from "imap"
import { Range } from "immutable"
import moment from "moment"
import * as cache from "./cache"
import { testThread } from "./cache/testFixtures"
import db from "./db"
import ConnectionManager from "./managers/ConnectionManager"
import { mockConnection, mockFetchImplementation } from "./request/testHelpers"
import { sync, fetchQuery } from "./sync"
import { mock } from "./testHelpers"

jest.mock("imap")

let accountId: cache.ID
let connectionManager: ConnectionManager

beforeEach(() => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid

  connectionManager = mockConnection()
})

it("records metadata for mailbox", async () => {
  await sync(accountId, connectionManager)
  expect(db.prepare("select * from boxes").all()).toMatchObject([
    { account_id: accountId, name: "[Gmail]/All Mail", uidvalidity: 123 }
  ])
})

it("downloads messages", async () => {
  await sync(accountId, connectionManager)
  const messages = db
    .prepare(
      `
        select account_id, uid from messages
      `
    )
    .all()
  expect(messages).toEqual(
    expect.arrayContaining([
      {
        account_id: accountId,
        uid: testThread[0].attributes.uid
      },
      {
        account_id: accountId,
        uid: testThread[1].attributes.uid
      }
    ])
  )
})

it("downloads complete conversations even if some messages do not match cache policy", async () => {
  await sync(accountId, connectionManager)
  mock(Connection.prototype.fetch).mockImplementation(
    mockFetchImplementation({
      thread: [
        {
          attributes: {
            ...testThread[0].attributes,
            date: moment()
              .subtract(2, "years")
              .toDate()
          },
          headers: testThread[0].headers
        },
        testThread[1]
      ]
    })
  )
})

it("gets updated flags for messages that are already downloaded", async () => {
  await sync(accountId, connectionManager)

  mock(Connection.prototype.fetch).mockImplementation(
    mockFetchImplementation({
      thread: [
        {
          attributes: {
            ...testThread[0].attributes,
            flags: ["\\Answered"]
          },
          headers: testThread[0].headers
        },
        {
          attributes: {
            ...testThread[1].attributes,
            flags: ["\\Answered", "\\Seen"]
          },
          headers: testThread[1].headers
        }
      ]
    })
  )

  await sync(accountId, connectionManager)

  expect(
    db
      .prepare(
        `
          select uid, flag from messages
          join message_flags on message_id = messages.id
          order by uid, flag
        `
      )
      .all()
  ).toMatchObject([
    { uid: 7467, flag: "\\Answered" },
    { uid: 7687, flag: "\\Answered" },
    { uid: 7687, flag: "\\Seen" }
  ])
})

it("gets updated labels for messages that are already downloaded", async () => {
  await sync(accountId, connectionManager)

  mock(Connection.prototype.fetch).mockImplementation(
    mockFetchImplementation({
      thread: [
        {
          attributes: {
            ...testThread[0].attributes,
            "x-gm-labels": ["\\Inbox", "\\Sent"]
          },
          headers: testThread[0].headers
        },
        {
          attributes: {
            ...testThread[1].attributes,
            "x-gm-labels": ["\\Inbox", "\\Sent", "Followup"]
          },
          headers: testThread[1].headers
        }
      ]
    })
  )

  await sync(accountId, connectionManager)

  expect(
    db
      .prepare(
        `
          select uid, label from messages
          join message_gmail_labels on message_id = messages.id
          order by uid, label
        `
      )
      .all()
  ).toMatchObject([
    { uid: 7467, label: "\\Inbox" },
    { uid: 7467, label: "\\Sent" },
    { uid: 7687, label: "Followup" },
    { uid: 7687, label: "\\Inbox" },
    { uid: 7687, label: "\\Sent" }
  ])
})

it("removes messages from cache if removed server-side", async () => {
  await sync(accountId, connectionManager)

  mock(Connection.prototype.fetch).mockImplementation(
    mockFetchImplementation({
      thread: testThread.slice(1)
    })
  )

  await sync(accountId, connectionManager)

  expect(db.prepare("select uid from messages").all()).toEqual([{ uid: 7687 }])
})

it("downloads any missing messages to get complete conversations", async () => {
  await sync(accountId, connectionManager)
  db.prepare(`delete from messages where uid = ?`).run(7467)
  await sync(accountId, connectionManager)
  expect(cache.getThreads(accountId)).toMatchObject([
    {
      messages: [{ uid: 7467 }, { uid: 7687 }]
    }
  ])
})

it("downloads bodies for messages", async () => {
  await sync(accountId, connectionManager)
  expect(
    db
      .prepare(
        `
          select uid, part_id, type, subtype, content from message_bodies
          join message_structs as structs on message_struct_id = structs.id
          join messages on message_id = messages.id
          order by uid, part_id
        `
      )
      .all()
      .map(({ content, ...rest }) => ({
        ...rest,
        content: content.toString("utf8")
      }))
  ).toMatchObject([
    {
      uid: 7467,
      part_id: "3",
      type: "text",
      subtype: "plain",
      content: "This is a test."
    },
    {
      uid: 7467,
      part_id: "4",
      type: "text",
      subtype: "html",
      content: "<p>This is a test.</p>"
    },
    {
      uid: 7467,
      part_id: "5",
      type: "image",
      subtype: "jpeg",
      content: ""
    },
    {
      uid: 7687,
      part_id: "1",
      type: "text",
      subtype: "plain",
      content: "A reply appears."
    }
  ])
})

it("uses UID ranges for smaller fetch requests", () => {
  expect(fetchQuery(Range(30020, 30000, -1))).toBe("30001:30020")
  expect(fetchQuery(Range(12, 20))).toBe("12:19")
  expect(fetchQuery(Range(12, 13))).toEqual([12])
  expect(fetchQuery(Range(12, 11, -1))).toEqual([12])
})

afterEach(() => {
  jest.restoreAllMocks()
  db.prepare("delete from accounts").run()
})
