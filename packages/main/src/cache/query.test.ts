import db from "../db"
import { getPartByPartId } from "../models/Message"
import {
  persistBoxState,
  persistAttributes,
  persistHeadersAndReferences,
  persistBody
} from "./persist"
import * as cache from "./query"
import { inbox, testContent, testThread } from "./testFixtures"
import { ID } from "./types"

let accountId: ID
let boxId: ID

beforeEach(() => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values(?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid
  boxId = persistBoxState(accountId, inbox)
  for (const message of testThread) {
    const id = persistAttributes({ accountId, boxId }, message.attributes)
    persistHeadersAndReferences(id, message.headers)
  }
})

it("gets threads from the cache", () => {
  expect(cache.getThreads(accountId)).toMatchObject([
    {
      id: "1624221157079778491",
      messages: [
        { uid: testThread[0].attributes.uid },
        { uid: testThread[1].attributes.uid }
      ]
    }
  ])
})

it("gets a thread by ID", () => {
  expect(
    cache.getThread(testThread[0].attributes["x-gm-thrid"]!)
  ).toMatchObject({
    id: "1624221157079778491",
    messages: [
      { uid: testThread[0].attributes.uid },
      { uid: testThread[1].attributes.uid }
    ]
  })
})

it("gets messages from the cache", () => {
  const { lastInsertRowid: otherAccountId } = db
    .prepare("insert into accounts (email) values(?)")
    .run("hallettj@gmail.com")
  const testMessage = testThread[0]
  const anotherThread = {
    attributes: {
      ...testMessage.attributes,
      envelope: { ...testMessage.attributes.envelope, messageId: "<otherId>" }
    },
    headers: testMessage.headers
  }
  const otherBoxId = persistBoxState(otherAccountId, inbox)
  persistAttributes(
    { accountId: otherAccountId, boxId: otherBoxId },
    anotherThread.attributes
  )

  expect(
    cache.getMessages(accountId).sort((a, b) => a.uid! - b.uid!)
  ).toMatchObject([
    { envelope_messageId: testThread[0].attributes.envelope.messageId },
    { envelope_messageId: testThread[1].attributes.envelope.messageId }
  ])
  expect(cache.getMessages(otherAccountId)).toMatchObject([
    { envelope_messageId: "<otherId>" }
  ])
})

it("gets participants for a message", () => {
  const { id: messageId } = db
    .prepare("select id from messages where uid = ?")
    .get(testThread[0].attributes.uid)
  expect(cache.getParticipants(messageId, "from")).toEqual([
    { name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }
  ])
})

it("reconstructs the tree structure of a message struct", () => {
  const testMessage = testThread[0]
  const { id } = db
    .prepare("select id from messages where uid = ?")
    .get(testMessage.attributes.uid)
  expect(cache.getStruct(id)).toMatchObject([
    {
      id: null,
      partID: "1",
      params: {},
      subtype: "mixed",
      type: "multipart"
    },
    [
      {
        id: null,
        partID: "2",
        params: {},
        subtype: "alternative",
        type: "multipart"
      },
      [
        {
          description: null,
          disposition: null,
          encoding: "7BIT",
          id: "textFallback",
          params: { charset: "UTF-8" },
          partID: "3",
          subtype: "plain",
          type: "text",
          size: 5
        }
      ],
      [
        {
          description: null,
          disposition: null,
          encoding: "7BIT",
          id: "htmlContent",
          md5: null,
          params: { charset: "UTF-8" },
          partID: "4",
          subtype: "html",
          type: "text",
          size: 8
        }
      ]
    ],
    [
      {
        disposition: {
          type: "attachment",
          params: { filename: "cat.jpg" }
        },
        encoding: "7BIT",
        id: "attachment",
        params: {},
        partID: "5",
        subtype: "jpeg",
        type: "image",
        size: 100
      }
    ]
  ])
})

it("gets a part body from the cache", () => {
  const message = testThread[0]
  const messageId = persistAttributes({ accountId, boxId }, message.attributes)
  const part = getPartByPartId("4", message.attributes)!
  const content = testContent
    .get(String(message.attributes.envelope.messageId))!
    .get(part.partID!)!
  persistBody(messageId, part, Buffer.from(content, "utf8"))
  expect(cache.getBody(messageId, part)).toEqual(
    Buffer.from("<p>This is a test.</p>", "utf8")
  )
})

describe("parts missing bodies", () => {
  it("identifies message parts whose bodies are missing", () => {
    expect(cache.partsMissingBodies({ accountId, boxId }).sort()).toMatchObject(
      [
        {
          uid: 7467,
          part: { partID: "3", type: "text", subtype: "plain" }
        },
        {
          uid: 7467,
          part: { partID: "4", type: "text", subtype: "html" }
        },
        {
          uid: 7467,
          part: { partID: "5", type: "image", subtype: "jpeg" }
        },
        {
          uid: 7687,
          part: { partID: "1", type: "text", subtype: "plain" }
        }
      ].sort()
    )
  })

  it("ignores parts in different boxes", () => {
    expect(cache.partsMissingBodies({ accountId, boxId: 999 })).toEqual([])
  })
})

afterEach(() => {
  db.prepare("delete from accounts").run()
})
