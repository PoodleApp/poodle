import * as cache from "../cache"
import { inbox, testThread } from "../cache/testFixtures"
import db from "../db"
import * as C from "../models/conversation"
import { MessageAttributes } from "../types"
import { composeReply } from "./reply"

let account: cache.Account
let accountId: cache.ID
let boxId: cache.ID

jest.mock("imap")

beforeEach(async () => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid
  account = cache.getAccount(accountId)!
  boxId = cache.persistBoxState(accountId, inbox)
})

describe("reply recipients", () => {
  it("produces list of participants for a reply", () => {
    const { attributes } = composeReply({
      account,
      content: { type: "text", subtype: "plain", content: "hi" },
      conversation: conversationFrom(testThread)
    })
    expect(attributes.envelope).toMatchObject({
      to: [{ name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }],
      cc: [],
      from: [{ mailbox: "jesse", host: "sitr.us" }]
    })
  })

  it("includes prior cc recipients in cc list for new message", () => {
    const conversation = conversationFrom([
      testThread[0],
      {
        attributes: {
          ...testThread[1].attributes,
          envelope: {
            ...testThread[1].attributes.envelope,
            cc: [{ name: "Eve", mailbox: "eve", host: "test.com" }]
          }
        }
      }
    ])
    const { attributes } = composeReply({
      account,
      content: { type: "text", subtype: "plain", content: "hi" },
      conversation
    })
    expect(attributes.envelope).toMatchObject({
      to: [{ name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }],
      cc: [{ name: "Eve", mailbox: "eve", host: "test.com" }],
      from: [{ mailbox: "jesse", host: "sitr.us" }]
    })
  })

  it("does not include participants in both 'to' and 'cc' fields", () => {
    const conversation = conversationFrom([
      {
        attributes: {
          ...testThread[1].attributes,
          envelope: {
            ...testThread[1].attributes.envelope,
            cc: [
              { name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" },
              { name: "Eve", mailbox: "eve", host: "test.com" }
            ]
          }
        }
      }
    ])
    const { attributes } = composeReply({
      account,
      content: { type: "text", subtype: "plain", content: "hi" },
      conversation
    })
    expect(attributes.envelope).toMatchObject({
      to: [{ name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }],
      cc: [{ name: "Eve", mailbox: "eve", host: "test.com" }],
      from: [{ mailbox: "jesse", host: "sitr.us" }]
    })
  })
})

afterEach(() => {
  db.prepare("delete from accounts").run()
})

function conversationFrom(
  messages: Array<{ attributes: MessageAttributes }>
): C.Conversation {
  for (const msg of messages) {
    cache.persistAttributes({ accountId, boxId }, msg.attributes)
  }
  return cache.getThreads(accountId)[0]
}
