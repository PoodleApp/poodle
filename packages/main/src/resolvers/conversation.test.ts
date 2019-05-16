import { graphql } from "graphql"
import Connection from "imap"
import * as cache from "../cache"
import { testThread } from "../cache/testFixtures"
import db from "../db"
import ConnectionManager from "../managers/ConnectionManager"
import { queue } from "../queue"
import { mockConnection, mockFetchImplementation } from "../request/testHelpers"
import schema from "../schema"
import { sync } from "../sync"
import { mock } from "../testHelpers"
import * as promises from "../util/promises"

jest.mock("imap")

let accountId: cache.ID
let connectionManager: ConnectionManager
let conversationId: string

beforeEach(async () => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid

  connectionManager = mockConnection()
  await sync(accountId, connectionManager)

  conversationId = (await graphql(
    schema,
    `
      query getConversations($accountId: ID!) {
        account(id: $accountId) {
          conversations {
            id
          }
        }
      }
    `,
    null,
    null,
    { accountId }
  )).data!.account.conversations[0].id
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

it("gets conversations by label", async () => {
  const result = await graphql(
    schema,
    `
      query getConversations($accountId: ID!, $label: String) {
        account(id: $accountId) {
          conversations(label: $label) {
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
    { accountId, label: "My Label" }
  )
  expect(result).toMatchObject({
    data: {
      account: {
        conversations: []
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

it("marks a conversation as read", async () => {
  mock(Connection.prototype.fetch).mockImplementation(
    mockFetchImplementation({
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
  )
  await sync(accountId, connectionManager)

  const result = await graphql(
    schema,
    `
      mutation setIsRead($conversationId: ID!, $isRead: Boolean!) {
        conversations {
          setIsRead(id: $conversationId, isRead: $isRead) {
            id
            isRead
          }
        }
      }
    `,
    null,
    null,
    { conversationId, isRead: true }
  )
  expect(result).toEqual({
    data: {
      conversations: {
        setIsRead: {
          id: conversationId,
          isRead: true
        }
      }
    }
  })
})

it("marks a conversation as unread", async () => {
  const result = await graphql(
    schema,
    `
      mutation setIsRead($conversationId: ID!, $isRead: Boolean!) {
        conversations {
          setIsRead(id: $conversationId, isRead: $isRead) {
            id
            isRead
          }
        }
      }
    `,
    null,
    null,
    { conversationId, isRead: false }
  )
  expect(result).toEqual({
    data: {
      conversations: {
        setIsRead: {
          id: conversationId,
          isRead: false
        }
      }
    }
  })
})

it("archives a conversation", async () => {
  const result = await graphql(
    schema,
    `
      mutation archive($conversationId: ID!) {
        conversations {
          archive(id: $conversationId) {
            id
            labels
          }
        }
      }
    `,
    null,
    null,
    { conversationId }
  )
  expect(result).toEqual({
    data: {
      conversations: {
        archive: {
          id: conversationId,
          labels: ["\\Important", "\\Sent"]
        }
      }
    }
  })
})

afterEach(async () => {
  db.prepare("delete from accounts").run()
  await promises.lift0(cb => queue.destroy(cb))
})
