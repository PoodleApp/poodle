import { MessageInput } from "../generated/graphql"
import { composeNewConversation } from "./newConversation"

describe("a message for a new Conversation", () => {
  it("has a content-ID", async () => {
    const account = { email: "jesse@sitr.us", id: 1 }

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
          type: message.content.type,
          subtype: message.content.subtype
        }
      ]
    })
  })
})
