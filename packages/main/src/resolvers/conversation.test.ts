import { graphql } from "graphql"
import { default as Connection, default as imap } from "imap"
import { idFromHeaderValue } from "poodle-common/lib/models/uri"
import * as cache from "../cache"
import { testThread } from "../cache/testFixtures"
import { composeEdit } from "../compose"
import db from "../db"
import { Conversation } from "../generated/graphql"
import ConnectionManager from "../managers/ConnectionManager"
import { queue } from "../queue"
import { mockConnection, mockFetchImplementation } from "../request/testHelpers"
import schema from "../schema"
import { sync } from "../sync"
import { mock } from "../testHelpers"
import * as promises from "../util/promises"

jest.mock("imap")

let account: cache.Account
let accountId: cache.ID
let connectionManager: ConnectionManager

beforeEach(async () => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid
  connectionManager = mockConnection()
  account = { id: accountId, email: "jesse@sitr.us" }
})

describe("when querying conversations", () => {
  let conversation: Conversation
  let conversationId: string
  let presentableId: string
  beforeEach(async () => {
    await sync(accountId, connectionManager)

    const result = await request(
      `
      query getConversations($accountId: ID!) {
        account(id: $accountId) {
          conversations {
            id
            presentableElements {
              id
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
    presentableId = conversation.presentableElements[0].id
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
              from: {
                name: "Jesse Hallett",
                mailbox: "jesse",
                host: "sitr.us"
              },
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

  it("gets a conversation by the message ID of its first message", async () => {
    const messageId = idFromHeaderValue(
      testThread[0].attributes.envelope.messageId
    )
    const result = await request(
      `
      query getConversation($conversationId: ID!) {
        conversation(id: $conversationId) {
          messageId
        }
      }
    `,
      { conversationId: messageId }
    )
    expect(result).toEqual({
      data: {
        conversation: {
          messageId
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
              disposition
              filename
              name
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
                  content: "<p>This is a test.</p>",
                  disposition: "inline",
                  filename: null,
                  name: null
                },
                {
                  type: "image",
                  subtype: "jpeg",
                  content: "",
                  disposition: "attachment",
                  filename: "cat.jpg",
                  name: null
                }
              ]
            },
            {
              id: expect.any(String),
              date: "2019-05-01T22:29:31.000Z",
              from: {
                name: "Jesse Hallett",
                mailbox: "jesse",
                host: "sitr.us"
              },
              contents: [
                {
                  type: "text",
                  subtype: "plain",
                  content: "A reply appears.",
                  disposition: "inline",
                  filename: null,
                  name: null
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
                },
                {
                  type: "image",
                  subtype: "jpeg",
                  content: ""
                }
              ]
            },
            {
              id: expect.any(String),
              date: "2019-05-01T22:29:31.000Z",
              from: {
                name: "Jesse Hallett",
                mailbox: "jesse",
                host: "sitr.us"
              },
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

  it("saves a draft when writing a reply", async () => {
    const result = await request(
      `
      mutation saveDraft($accountId: ID!, $conversationId: ID!, $content: ContentInput!) {
        conversations {
          saveDraft(accountId: $accountId, id: $conversationId, content: $content) {
            id
            presentableElements {
              contents {
                type
                subtype
                content
              }
              id
              isDraft
            }
            labels
            snippet
            subject
            replyDraft{
              presentables{
                contents {
                  type
                  subtype
                  content
                }
                id
                isDraft
              }
            }
          }
        }
      }
      `,
      {
        conversationId,
        accountId,
        content: { type: "text", subtype: "plain", content: "this is a reply" }
      }
    )

    expect(result).toMatchObject({
      data: {
        conversations: {
          saveDraft: {
            replyDraft: {
              presentables: [
                {
                  contents: expect.arrayContaining([
                    {
                      type: "text",
                      subtype: "plain",
                      content: "this is a reply"
                    }
                  ]),
                  isDraft: true
                }
              ]
            }
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

  it("stars a conversation", async () => {
    const result = await request(
      `
      mutation flag($conversationIDs: [ID!]!, $isFlagged: Boolean!) {
        conversations {
          flag(ids: $conversationIDs, isFlagged: $isFlagged) {
            id
            isStarred
          }
        }
      }
      `,
      { conversationIDs: [conversationId], isFlagged: true }
    )
    expect(result).toEqual({
      data: {
        conversations: {
          flag: [
            {
              id: conversationId,
              isStarred: true
            }
          ]
        }
      }
    })
  })

  it("un-stars a conversation", async () => {
    const result = await request(
      `
      mutation flag($conversationIDs: [ID!]!, $isFlagged: Boolean!) {
        conversations {
          flag(ids: $conversationIDs, isFlagged: $isFlagged) {
            id
            isStarred
          }
        }
      }
      `,
      { conversationIDs: [conversationId], isFlagged: false }
    )
    expect(result).toEqual({
      data: {
        conversations: {
          flag: [
            {
              id: conversationId,
              isStarred: false
            }
          ]
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
                  },
                  {
                    type: "image",
                    subtype: "jpeg",
                    content: ""
                  }
                ]
              },
              {
                contents: [
                  {
                    type: "text",
                    subtype: "plain",
                    content: "A reply appears."
                  }
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
          to: [
            { name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }
          ],
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
                  },
                  {
                    type: "image",
                    subtype: "jpeg",
                    content: ""
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

  it("stars an edited message", async () => {
    const revisedContent = "What I meant to say was, hi."
    await sendEdit({
      type: "text",
      subtype: "plain",
      content: revisedContent
    })
    const result = await request(
      `
        mutation flagPresentable($presentableId: ID!, $conversationId: ID!, $isFlagged: Boolean!){
          conversations {
            flagPresentable(id: $presentableId, conversationId: $conversationId, isFlagged: $isFlagged){
              presentableElements {
                id
                isStarred
              }
              id
              isStarred
            }
          }
        }
      `,
      { conversationId: conversationId, isFlagged: true, presentableId }
    )

    expect(result).toMatchObject({
      data: {
        conversations: {
          flagPresentable: {
            id: conversationId,
            isStarred: true,
            presentableElements: expect.arrayContaining([
              {
                id: presentableId,
                isStarred: true
              }
            ])
          }
        }
      }
    })
  })

  it("un-stars an edited message", async () => {
    const revisedContent = "What I meant to say was, hi."
    await sendEdit({
      type: "text",
      subtype: "plain",
      content: revisedContent
    })
    const result = await request(
      `
        mutation flagPresentable($presentableId: ID!, $conversationId: ID!, $isFlagged: Boolean!){
          conversations {
            flagPresentable(id: $presentableId, conversationId: $conversationId, isFlagged: $isFlagged){
              presentableElements {
                id
                isStarred
              }
              id
              isStarred
            }
          }
        }
      `,
      { conversationId: conversationId, isFlagged: false, presentableId }
    )

    expect(result).toMatchObject({
      data: {
        conversations: {
          flagPresentable: {
            id: conversationId,
            isStarred: false,
            presentableElements: expect.arrayContaining([
              {
                id: presentableId,
                isStarred: false
              }
            ])
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
      }
    })
    editMessage.attributes.uid = 9000
    editMessage.attributes["x-gm-labels"] = ["\\Inbox"]
    mockConnection({ thread: [...testThread, editMessage] })
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
                },
                {
                  type: "image",
                  subtype: "jpeg",
                  content: ""
                }
              ]
            },
            {
              date: "2019-05-01T22:29:31.000Z",
              from: {
                name: "Jesse Hallett",
                mailbox: "jesse",
                host: "sitr.us"
              },
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

  it("uses the read status of a message's most recent revision as the read status of the presentable", async () => {
    const orig = cache.getThreads(accountId)[0]
    const message = testThread[1].attributes

    expect(cache.getFlags(message.envelope.messageId).includes("//Seen")).toBe(
      false
    )

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
              isRead
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
              isRead: true
            },
            {
              isRead: true
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
                  "CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com",
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
                  "CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com",
                subject: "Test thread 2019-02"
              },
              query: "test thread"
            }
          ]
        }
      })
    })

    it("prevents sqlite from interpreting parts of query as special match expression tokens", async () => {
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
        { query: "test AND" }
      )
      expect(result).not.toMatchObject({
        errors: expect.anything()
      })
      expect(result).toMatchObject({
        data: {
          conversations: []
        }
      })
    })
  })

  async function sendEdit(content: {
    type: string
    subtype: string
    content: string
  }) {
    const {
      resource,
      revision
    } = conversation.presentableElements[1].contents[0]
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
})

describe("when addressing replies", () => {
  it("sends to a previous message's replyTo address when one is provided", async () => {
    mock(Connection.prototype.fetch).mockImplementation(
      mockFetchImplementation({
        thread: [
          testThread[0],
          {
            ...testThread[1],
            attributes: {
              ...testThread[1].attributes,
              envelope: {
                ...testThread[1].attributes.envelope,
                replyTo: [
                  { name: "Jesse Hallett", mailbox: "jesse", host: "test.com" }
                ]
              }
            }
          }
        ]
      })
    )
    await sync(accountId, connectionManager)

    const result = await request(
      `
        query getConversation($conversationId: ID!, $accountId: ID!) {
          conversation(id: $conversationId) {
            id
            replyRecipients(fromAccountId: $accountId) {
              from {
                name
                mailbox
                host
              }
              to {
                name
                mailbox
                host
              }
              cc {
                name
                mailbox
                host
              }
            }
          }
        }
      `,
      { conversationId: testThread[1].attributes["x-gm-thrid"], accountId }
    )
    expect(result).toEqual({
      data: {
        conversation: {
          id: "1624221157079778491",
          replyRecipients: {
            from: [
              {
                name: null,
                mailbox: "jesse",
                host: "sitr.us"
              }
            ],
            to: [
              {
                name: "Jesse Hallett",
                mailbox: "hallettj",
                host: "gmail.com"
              },
              {
                name: "Jesse Hallett",
                mailbox: "jesse",
                host: "test.com"
              }
            ],
            cc: []
          }
        }
      }
    })
  })
})

function request(query: string, variables?: Record<string, any>) {
  return graphql(schema, query, null, null, variables)
}

afterEach(async () => {
  db.prepare("delete from accounts").run()
  await promises.lift0(cb => queue.destroy(cb))
})
