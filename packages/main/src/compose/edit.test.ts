import imap from "imap"
import * as cache from "../cache"
import { inbox, testThread } from "../cache/testFixtures"
import db from "../db"
import * as C from "../models/conversation"
import { MessageAttributes } from "../types"
import { composeEdit } from "./edit"

let account: cache.Account
let accountId: cache.ID
let boxId: cache.ID

beforeEach(async () => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid
  account = cache.getAccount(accountId)!
  boxId = cache.persistBoxState(accountId, inbox)
})

it("edits a message", () => {
  const content = {
    type: "text",
    subtype: "plain",
    content: "What I meant to say was, hello!"
  }
  const testMessage = testThread[1].attributes
  const testPart = testMessage.struct![0] as imap.ImapMessagePart
  const editedMessage = {
    envelope_messageId: testMessage.envelope.messageId
  }
  const editedPart = {
    content_id: testPart.id
  }
  const { attributes, bodies, partHeaders } = composeEdit({
    account,
    content,
    conversation: conversationFrom(testThread),
    editedMessage,
    editedPart,
    resource: {
      messageId: testMessage.envelope.messageId,
      contentId: testPart.id
    }
  })
  expect(attributes).toMatchObject({
    struct: [
      {
        type: "multipart",
        subtype: "mixed",
        partID: "1"
      },
      [
        {
          type: "text",
          subtype: "plain",
          partID: "2",
          disposition: { type: "fallback" }
        }
      ],
      [
        {
          type: "text",
          subtype: "plain",
          partID: "3",
          id: expect.stringMatching(/.+@.+/),
          disposition: { type: "replacement" }
        }
      ]
    ]
  })
  expect(bodies["2"].toString("utf8")).toBe(`Edited message:`)
  expect(bodies["3"].toString("utf8")).toBe(content.content)
  expect(partHeaders).toMatchObject({
    "3": [
      [
        "replaces",
        {
          value:
            "<mid:CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA%40mail.gmail.com/0337ae7e-c468-437d-b7e1-95dc7d9debb8%40gmail.com>",
          params: {
            resource:
              "<mid:CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA%40mail.gmail.com/0337ae7e-c468-437d-b7e1-95dc7d9debb8%40gmail.com>"
          }
        }
      ]
    ]
  })
})

function conversationFrom(
  messages: Array<{ attributes: MessageAttributes }>
): C.Conversation {
  for (const msg of messages) {
    cache.persistAttributes({ accountId, boxId }, msg.attributes)
  }
  return cache.getThreads(accountId)[0]
}
