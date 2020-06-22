import { List } from "immutable"
import * as React from "react"
import { Node, Value } from "slate"
import { Editor } from "slate-react"
import { mount } from "../testing"
import * as $ from "../testing/fixtures"
import ReplyForm from "./ReplyForm"

const replyRecipients = {
  to: [{ name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }],
  cc: [{ mailbox: "logging", host: "dev.com" }],
  from: [{ name: "Jesse Hallett", mailbox: "jesse", host: "sitr.us" }]
}

it("displays reply recipients", () => {
  const app = mount(
    <ReplyForm
      accountId={$.account.id}
      conversationId={$.conversation.id}
      replyRecipients={replyRecipients}
    />
  )
  expect(app).toIncludeText("Reply to JJesse Hallett")
  expect(app).toIncludeText("Cc Llogging@dev.com")
})

it("creates a reply", async () => {
  const value = Value.fromJSON({
    document: {
      nodes: [
        {
          object: "block",
          type: "paragraph",
          nodes: [
            {
              object: "text",
              text: "This is a reply"
            }
          ]
        }
      ]
    }
  })
  const app = mount(
    <ReplyForm
      accountId={$.account.id}
      conversationId={$.conversation.id}
      replyRecipients={replyRecipients}
    />,
    { mocks: [$.replyMock("<p>This is a reply</p>")] }
  )
  app.find(Editor).prop("onChange")!({ operations: List(), value })
  app.find("form").simulate("submit")
})
