import imap from "imap"
import { graphql } from "graphql"
import Connection from "imap"
import * as cache from "../cache"
import { testThread } from "../cache/testFixtures"
import db from "../db"
import { Conversation } from "../generated/graphql"
import ConnectionManager from "../managers/ConnectionManager"
import { queue } from "../queue"
import { mockConnection, mockFetchImplementation } from "../request/testHelpers"
import schema from "../schema"
import { sync } from "../sync"
import { mock } from "../testHelpers"
import * as promises from "../util/promises"
import { composeEdit } from "../compose"

jest.mock("imap")

let account: cache.Account
let accountId: cache.ID
let connectionManager: ConnectionManager
let conversation: Conversation
let conversationId: string

beforeEach(async () => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid
  account = { id: accountId, email: "jesse@sitr.us" }

  connectionManager = mockConnection()
  await sync(accountId, connectionManager)

  const result = await request(
    `
      query getConversations($accountId: ID!) {
        account(id: $accountId) {
          conversations {
            id
            presentableElements {
              contents {
                resource { messageId, contentId }
                revision { messageId, contentId }
              }
            }
          }
        }
      }
    `,
    { accountId }
  )
  expect(result).toMatchObject({ data: expect.anything() })
  conversation = result.data!.account.conversations[0]
  conversationId = conversation.id
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
            replyRecipients(fromAccountId: $accountId) { to { name, mailbox, host }}
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
            replyRecipients: {
              to: [
                {
                  name: "Jesse Hallett",
                  mailbox: "hallettj",
                  host: "gmail.com"
                }
              ]
            },
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
          ...testThread[1],
          attributes: { ...testThread[1].attributes, uid: 9999 }
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
          ...testThread[0],
          attributes: { ...testThread[0].attributes, flags: ["\\Answered"] },
          headers: testThread[0].headers
        },
        {
          ...testThread[1],
          attributes: { ...testThread[1].attributes, flags: [] }
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

it("starts a new conversation", async () => {
  const result = await request(
    `
      mutation sendMessage($accountId: ID!, $message: MessageInput!) {
        conversations {
          sendMessage(accountId: $accountId, message: $message) {
            from {
              name
              mailbox
              host
            }
            presentableElements {
              contents {
                type
                subtype
                content
              }
            }
            isRead
            subject
          }
        }
      }
    `,
    {
      accountId,
      message: {
        subject: "Sent from Poodle",
        to: [{ name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }],
        content: { type: "text", subtype: "plain", content: "hello there" }
      }
    }
  )
  expect(result).toMatchObject({
    data: {
      conversations: {
        sendMessage: {
          from: { name: null, mailbox: "jesse", host: "sitr.us" },
          presentableElements: [
            {
              contents: [
                { type: "text", subtype: "plain", content: "hello there" }
              ]
            }
          ],
          isRead: true,
          subject: "Sent from Poodle"
        }
      }
    }
  })
})

it("sends an edit", async () => {
  const revisedContent = "What I meant to say was, hi."
  const result = await sendEdit({
    type: "text",
    subtype: "plain",
    content: revisedContent
  })
  expect(result).toMatchObject({
    data: {
      conversations: {
        edit: {
          from: { name: null, mailbox: "jesse", host: "sitr.us" },
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
                { type: "text", subtype: "plain", content: revisedContent }
              ]
            }
          ],
          isRead: true,
          subject: "Test thread 2019-02"
        }
      }
    }
  })
})

it("applies edits to get updated content", async () => {
  const orig = cache.getThreads(accountId)[0]
  const message = testThread[1].attributes
  const part = message.struct![0] as imap.ImapMessagePart
  const revisedContent = "What I meant to say was, hi."
  const editMessage = composeEdit({
    account,
    content: {
      type: "text",
      subtype: "plain",
      content: revisedContent
    },
    conversation: orig,
    editedMessage: { envelope_messageId: message.envelope.messageId },
    editedPart: {
      content_id: part.id
    },
    resource: {
      messageId: message.envelope.messageId,
      contentId: part.id
    }
  })
  editMessage.attributes.uid = 9000
  const threadWithEdit = [...testThread, editMessage]
  mock(Connection.prototype.fetch).mockImplementation(
    mockFetchImplementation({ thread: threadWithEdit })
  )
  await sync(accountId, connectionManager)

  const result = await request(
    `
      query getConversation($conversationId: ID!) {
        conversation(id: $conversationId) {
          presentableElements {
            date
            from {
              name
              mailbox
              host
            }
            editedAt
            editedBy {
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
  expect(result).toMatchObject({
    data: {
      conversation: {
        presentableElements: [
          {
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
            date: "2019-05-01T22:29:31.000Z",
            from: { name: "Jesse Hallett", mailbox: "jesse", host: "sitr.us" },
            editedAt: editMessage.attributes.date.toISOString(),
            editedBy: {
              mailbox: "jesse",
              host: "sitr.us"
            },
            contents: [
              {
                type: "text",
                subtype: "plain",
                content: revisedContent
              }
            ]
          }
        ]
      }
    }
  })
})

describe("searching", () => {
  it("lists conversations whose subject matches a given query", async () => {
    const result = await request(
      `
        query searchConversations($query: String!) {
          conversations(query: $query) {
            conversation {
              messageId
              subject
            }
            query
          }
        }
      `,
      { query: "test thread" }
    )
    expect(result).toMatchObject({
      data: {
        conversations: [
          {
            conversation: {
              messageId:
                "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>",
              subject: "Test thread 2019-02"
            },
            query: "test thread"
          }
        ]
      }
    })
  })

  it("list conversations whose subject partially overlaps with a given query", async () => {
    const result = await request(
      `
        query searchConversations($query: String!) {
          conversations(query: $query) {
            conversation {
              messageId
              subject
            }
            query
          }
        }
      `,
      { query: "refer to the test thread" }
    )
    expect(result).toMatchObject({
      data: {
        conversations: [
          {
            conversation: {
              messageId:
                "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>",
              subject: "Test thread 2019-02"
            },
            query: "test thread"
          }
        ]
      }
    })
  })
})

async function sendEdit(content: {
  type: string
  subtype: string
  content: string
}) {
  const { resource, revision } = conversation.presentableElements[1].contents[0]
  const result = await request(
    `
      mutation editMessage(
        $accountId: ID!,
        $conversationId: ID!,
        $resource: PartSpecInput!,
        $revision: PartSpecInput!,
        $content: ContentInput!
      ) {
        conversations {
          edit(
            accountId: $accountId,
            conversationId: $conversationId,
            resource: $resource,
            revision: $revision,
            content: $content
          ) {
            from {
              name
              mailbox
              host
            }
            presentableElements {
              contents {
                type
                subtype
                content
              }
            }
            isRead
            subject
          }
        }
      }
    `,
    {
      accountId,
      conversationId,
      resource,
      revision,
      content
    }
  )
  expect(result).toMatchObject({ data: expect.anything() })
  return result
}

function request(query: string, variables?: Record<string, any>) {
  return graphql(schema, query, null, null, variables)
}

afterEach(async () => {
  db.prepare("delete from accounts").run()
  await promises.lift0(cb => queue.destroy(cb))
})
