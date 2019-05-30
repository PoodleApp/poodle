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

  conversationId = (await request(
    `
      query getConversations($accountId: ID!) {
        account(id: $accountId) {
          conversations {
            id
          }
        }
      }
    `,
    { accountId }
  )).data!.account.conversations[0].id
})

it("gets metadata for a conversation from cache", async () => {
  const result = await request(
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
            snippet
            subject
          }
        }
      }
    `,
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
            snippet: "A reply appears.",
            subject: "Test thread 2019-02"
          }
        ]
      }
    }
  })
})

it("gets conversations by label", async () => {
  const result = await request(
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
  const result = await request(
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

it("ignores duplicate copies of messages", async () => {
  mock(Connection.prototype.fetch).mockImplementation(
    mockFetchImplementation({
      thread: [
        testThread[0],
        testThread[1],
        {
          attributes: { ...testThread[1].attributes, uid: 9999 },
          headers: testThread[1].headers
        }
      ]
    })
  )
  await sync(accountId, connectionManager)

  const result = await request(
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

  const result = await request(
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
  const result = await request(
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
  const result = await request(
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

it("accepts a reply to a conversation", async () => {
  const result = await request(
    `
      mutation reply($accountId: ID!, $conversationId: ID!, $content: ContentInput!) {
        conversations {
          reply(accountId: $accountId, id: $conversationId, content: $content) {
            presentableElements {
              contents {
                type
                subtype
                content
              }
            }
          }
        }
      }
    `,
    {
      accountId,
      conversationId,
      content: { type: "text", subtype: "plain", content: "this is a reply" }
    }
  )
  expect(result).toMatchObject({
    data: {
      conversations: {
        reply: {
          presentableElements: [
            {
              contents: [
                {
                  type: "text",
                  subtype: "html",
                  content: "<p>This is a test.</p>"
                }
              ]
            },
            {
              contents: [
                { type: "text", subtype: "plain", content: "A reply appears." }
              ]
            },
            {
              contents: [
                { type: "text", subtype: "plain", content: "this is a reply" }
              ]
            }
          ]
        }
      }
    }
  })
})

function request(query: string, variables?: Record<string, any>) {
  return graphql(schema, query, null, null, variables)
}

afterEach(async () => {
  db.prepare("delete from accounts").run()
  await promises.lift0(cb => queue.destroy(cb))
})
