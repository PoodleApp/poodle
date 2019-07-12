import { Collapse } from "@material-ui/core"
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

it("collapses read messages, with the exception of the last message in the conversation", async () => {
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

  expect(
    app
      .find("Presentable")
      .filterWhere(n => n.props().presentable.id === "11")
      .find(Collapse)
  ).toHaveProp("in", false)

  expect(
    app
      .find("Presentable")
      .filterWhere(n => n.props().presentable.id === "12")
      .find(Collapse)
  ).toHaveProp("in", true)
})

it("does not collapse unread messages", async () => {
  const convo = {
    ...$.getConversationMock,
    result: {
      data: {
        conversation: {
          ...$.conversation,
          presentableElements: [
            {
              ...$.conversation.presentableElements[0],
              isRead: false
            },
            {
              ...$.conversation.presentableElements[1]
            }
          ]
        }
      }
    }
  }

  const app = mount(
    <Conversation
      accountId={$.account.id}
      conversationId={$.conversation.id}
    />,
    {
      mocks: [convo, $.setIsReadMock]
    }
  )
  await updates(app)

  expect(
    app
      .find("Presentable")
      .filterWhere(n => n.props().presentable.id === "11")
      .find(Collapse)
  ).toHaveProp("in", true)
})
