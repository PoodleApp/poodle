import { Collapse } from "@material-ui/core"
import PhotoIcon from "@material-ui/icons/Photo"
import StarIcon from "@material-ui/icons/Star"
import StarBorder from "@material-ui/icons/StarBorder"
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

it("displays an attachment", async () => {
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
  expect(app).toIncludeText("cat.jpg")
  expect(app.find(PhotoIcon)).toExist()
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

  expect(app.find({ presentable: { id: "11" } }).find(Collapse)).toHaveProp(
    "in",
    false
  )

  expect(app.find({ presentable: { id: "12" } }).find(Collapse)).toHaveProp(
    "in",
    false
  )

  expect(app.find({ presentable: { id: "13" } }).find(Collapse)).toHaveProp(
    "in",
    true
  )
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

  expect(app.find({ presentable: { id: "11" } }).find(Collapse)).toHaveProp(
    "in",
    true
  )
})

it("stars a presentable in conversation view", async () => {
  const app = mount(
    <Conversation
      accountId={$.account.id}
      conversationId={$.conversation.id}
    />,
    {
      mocks: [
        $.getConversationMock,
        $.flagPresentableMock({ isFlagged: true, presentableId: "11" })
      ]
    }
  )

  await updates(app)

  app
    .find({ presentable: { id: "11" } })
    .find(StarBorder)
    .simulate("click")

  await updates(app, 10)

  expect(app.find(StarIcon)).toExist()
})

it("un-stars a presentable in conversation view", async () => {
  const app = mount(
    <Conversation
      accountId={$.account.id}
      conversationId={$.conversation.id}
    />,
    {
      mocks: [
        {
          ...$.getConversationMock,
          result: {
            data: {
              conversation: {
                ...$.conversation,
                isStarred: true,
                presentableElements: [
                  {
                    ...$.conversation.presentableElements[0],
                    isStarred: true
                  },
                  { ...$.conversation.presentableElements[1] }
                ]
              }
            }
          }
        },
        $.flagPresentableMock({ isFlagged: false, presentableId: "11" })
      ]
    }
  )

  await updates(app)
  app
    .find({ presentable: { id: "11" } })
    .find(StarIcon)
    .simulate("click")
  await updates(app, 10)

  expect(app.find(StarBorder)).toExist()
})
