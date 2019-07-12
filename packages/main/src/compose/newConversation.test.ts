import * as cache from "../cache"
import { inbox } from "../cache/testFixtures"
import db from "../db"
import { MessageInput } from "../generated/graphql"
import { composeNewConversation } from "./newConversation"

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
describe("a message for a new Conversation", () => {
  it("has a content-ID", async () => {
    const message: MessageInput = {
      subject: "testing",
      to: [{ host: "test.com", mailbox: "ben", name: "Ben Reitman" }],
      content: {
        type: "text",
        subtype: "plain",
        content: "hey just testing"
      }
    }

    const { attributes } = composeNewConversation({ account, message })

    expect(attributes).toMatchObject({
      struct: [
        {
          id: expect.any(String),
          partID: "1",
          type: message.content.type,
          subtype: message.content.subtype,
          params: { charset: "UTF-8" }
        }
      ]
    })
  })
})
