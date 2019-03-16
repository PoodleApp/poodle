import { graphql } from "graphql"
import Connection from "imap"
import * as cache from "../cache"
import { inbox, testThread } from "../cache/testFixtures"
import db from "../db"
import ConnectionManager from "../managers/ConnectionManager"
import { mockFetchImplementation } from "../request/testHelpers"
import schema from "../schema"
import { sync } from "../sync"
import { mock } from "../testHelpers"

jest.mock("imap")

let accountId: cache.ID

beforeEach(async () => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid

  const boxes = {
    INBOX: { attribs: ["\\Inbox"] }
  }
  mock(Connection.prototype.getBoxes).mockImplementation((cb: any) => {
    cb(null, boxes)
  })
  mock(Connection.prototype.fetch).mockImplementation(mockFetchImplementation())
  mock(Connection.prototype.connect).mockReturnValue(undefined)

  const connectionManager = new ConnectionManager(async () => {
    const conn = new Connection({})
    conn.state = "connected"
    ;(conn as any)._box = inbox
    return conn
  })
  await sync(accountId, connectionManager)
})

it("gets metadata for a conversation from cache", async () => {
  const result = await graphql(
    schema,
    `
      query getConversations($accountId: ID!) {
        account(id: $accountId) {
          conversations {
            id
            date
            from {
              name
              mailbox
              host
            }
            isRead
            subject
          }
        }
      }
    `,
    null,
    null,
    { accountId }
  )
  expect(result).toMatchObject({
    data: {
      account: {
        conversations: [
          {
            id: "1624221157079778491",
            date: "2019-05-01T22:29:31.000Z",
            from: { name: "Jesse Hallett", mailbox: "jesse", host: "sitr.us" },
            isRead: true,
            subject: "Test thread 2019-02"
          }
        ]
      }
    }
  })
})

it("gets a list of presentable elements for a conversation", async () => {
  const result = await graphql(
    schema,
    `
      query getConversation($conversationId: ID!) {
        conversation(id: $conversationId) {
          id
          presentableElements {
            id
            date
            from {
              name
              mailbox
              host
            }
            contents {
              type
              subtype
              content
            }
          }
        }
      }
    `,
    null,
    null,
    { conversationId: testThread[0].attributes["x-gm-thrid"] }
  )
  expect(result).toEqual({
    data: {
      conversation: {
        id: "1624221157079778491",
        presentableElements: [
          {
            id: expect.any(String),
            date: "2019-01-31T23:40:04.000Z",
            from: {
              name: "Jesse Hallett",
              mailbox: "hallettj",
              host: "gmail.com"
            },
            contents: [
              {
                type: "text",
                subtype: "html",
                content: "<p>This is a test.</p>"
              }
            ]
          },
          {
            id: expect.any(String),
            date: "2019-05-01T22:29:31.000Z",
            from: { name: "Jesse Hallett", mailbox: "jesse", host: "sitr.us" },
            contents: [
              {
                type: "text",
                subtype: "plain",
                content: "A reply appears."
              }
            ]
          }
        ]
      }
    }
  })
})

afterEach(() => {
  db.prepare("delete from accounts").run()
})
