import { default as Connection, default as imap } from "imap"
import { Range } from "immutable"
import moment from "moment"
import * as cache from "./cache"
import { testThread } from "./cache/testFixtures"
import { composeEdit } from "./compose"
import db from "./db"
import ConnectionManager from "./managers/ConnectionManager"
import { publishMessageUpdates } from "./pubsub"
import { mockConnection, mockFetchImplementation } from "./request/testHelpers"
import { fetchQuery, sync } from "./sync"
import { mock } from "./testHelpers"

jest.mock("imap")
jest.mock("./pubsub")

let account: cache.Account
let accountId: cache.ID
let connectionManager: ConnectionManager

beforeEach(() => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid
  account = { id: accountId, email: "jesse@sitr.us" }

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
          ...testThread[0],
          attributes: {
            ...testThread[0].attributes,
            date: moment()
              .subtract(2, "years")
              .toDate()
          }
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
          ...testThread[0],
          attributes: {
            ...testThread[0].attributes,
            flags: ["\\Answered"]
          }
        },
        {
          ...testThread[1],
          attributes: {
            ...testThread[1].attributes,
            flags: ["\\Answered", "\\Seen"]
          }
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
          ...testThread[0],
          attributes: {
            ...testThread[0].attributes,
            "x-gm-labels": ["\\Inbox", "\\Sent"]
          }
        },
        {
          ...testThread[1],
          attributes: {
            ...testThread[1].attributes,
            "x-gm-labels": ["\\Inbox", "\\Sent", "Followup"]
          }
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

it("downloads message part headers", async () => {
  await sync(accountId, connectionManager)
  const orig = cache.getThreads(accountId)[0]
  const message = testThread[1].attributes
  const part = message.struct![0] as imap.ImapMessagePart
  const editMessage = composeEdit({
    account,
    content: {
      type: "text",
      subtype: "plain",
      content: "What I meant to say was, hi."
    },
    conversation: orig,
    editedMessage: { envelope_messageId: message.envelope.messageId },
    editedPart: {
      content_id: part.id
    }
  })
  editMessage.attributes.uid = 9000
  editMessage.attributes["x-gm-labels"] = ["\\Inbox"]

  // Update fake IMAP connection responses to incorporate `editMessage`.
  mockConnection({ thread: [...testThread, editMessage] })

  await sync(accountId, connectionManager)
  expect(
    db
      .prepare(
        `
          select key, value from message_part_headers
          join message_structs on message_struct_id = message_structs.id
          join messages on message_id = messages.id
          where uid = @uid
        `
      )
      .all({ uid: editMessage.attributes.uid })
  ).toContainEqual({
    key: "replaces",
    value:
      '"<mid:CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA%40mail.gmail.com/0337ae7e-c468-437d-b7e1-95dc7d9debb8%40gmail.com>"'
  })
})

it("uses UID ranges for smaller fetch requests", () => {
  expect(fetchQuery(Range(30020, 30000, -1))).toBe("30001:30020")
  expect(fetchQuery(Range(12, 20))).toBe("12:19")
  expect(fetchQuery(Range(12, 13))).toEqual([12])
  expect(fetchQuery(Range(12, 11, -1))).toEqual([12])
})

it("sends notifications that messages have been updated", async () => {
  await sync(accountId, connectionManager)
  expect(publishMessageUpdates).toHaveBeenCalled()
})

afterEach(() => {
  jest.resetAllMocks()
  db.prepare("delete from accounts").run()
})
