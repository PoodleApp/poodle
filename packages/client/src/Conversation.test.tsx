import { CardContent } from "@material-ui/core"
import * as React from "react"
import Conversation from "./Conversation"
import { delay, mount, updates } from "./testing"
import * as $ from "./testing/fixtures"

it("displays a conversation", async () => {
  const app = mount(
    <Conversation
      accountId={$.account.id}
      conversationId={$.conversation.id}
    />,
    {
      mocks: [$.getConversationMock, $.setIsReadMock]
    }
  )
  await delay()
  expect(app).toIncludeText("Hello from test")
})

it("displays a loading indicator while the conversation is loading", () => {
  const app = mount(
    <Conversation
      accountId={$.account.id}
      conversationId={$.conversation.id}
    />,
    {
      mocks: [$.getConversationMock, $.setIsReadMock]
    }
  )
  expect(app).toIncludeText("Loading...")
})

it("collapses read messages in a conversation", async () => {
  const app = mount(
    <Conversation
      accountId={$.account.id}
      conversationId={$.conversation.id}
    />,
    {
      mocks: [$.getConversationMock, $.setIsReadMock]
    }
  )
  await updates(app)

  expect(app.find(CardContent)).toEqual({})
})
