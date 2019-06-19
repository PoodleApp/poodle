import * as React from "react"
import Conversation from "./Conversation"
import { delay, mount } from "./testing"
import * as $ from "./testing/fixtures"

it("displays a conversation", async () => {
  const mocks = [$.getConversationMock, $.setIsReadMock]
  const app = mount(
    <Conversation accountId="1" conversationId={$.conversation.id} />,
    {
      mocks
    }
  )
  await delay()
  expect(app.text()).toMatch("Hello from test")
})

it("displays a loading indicator while the conversation is leading", () => {
  const mocks = [$.getConversationMock, $.setIsReadMock]
  const app = mount(
    <Conversation accountId="1" conversationId={$.conversation.id} />,
    {
      mocks
    }
  )
  expect(app.text()).toMatch("Loading...")
})
