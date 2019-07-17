import { ListItemText } from "@material-ui/core"
import StarIcon from "@material-ui/icons/Star"
import StarBorder from "@material-ui/icons/StarBorder"
import * as React from "react"
import Avatar from "./Avatar"
import Conversation from "./Conversation"
import Dashboard from "./Dashboard"
import { mount, updates } from "./testing"
import * as $ from "./testing/fixtures"

it("stars a conversation in list view", async () => {
  const app = mount(<Dashboard accountId={$.account.id} />, {
    mocks: [
      $.getAccountMock,
      $.flagMock,
      {
        ...$.getAccountMock,
        result: {
          data: {
            account: {
              ...$.account,
              conversations: [{ ...$.conversation, isStarred: true }]
            }
          }
        }
      }
    ]
  })

  await updates(app)
  app.find(Avatar).simulate("click")
  app.find('button[aria-label="star"]').simulate("click")
  await updates(app, 10)

  console.log(app.find("SelectedActionsBar").props())

  expect(app.find(ListItemText)).toIncludeText("★ ")
})

it("un-stars a conversation in list view", async () => {
  const app = mount(<Dashboard accountId={$.account.id} />, {
    mocks: [
      {
        ...$.getAccountMock,
        result: {
          data: {
            account: {
              ...$.account,
              conversations: [{ ...$.conversation, isStarred: true }]
            }
          }
        }
      },
      $.unFlagMock,
      $.getAccountMock
    ]
  })

  await updates(app)
  app.find(Avatar).simulate("click")
  app.find('button[aria-label="star"]').simulate("click")
  await updates(app, 10)

  // console.log(app.find("SelectedActionsBar").props())

  expect(app.find(ListItemText)).not.toIncludeText("★ ")
})

it("stars a conversation in conversation view", async () => {
  const app = mount(
    <Conversation
      accountId={$.account.id}
      conversationId={$.conversation.id}
    />,
    {
      mocks: [
        $.getConversationMock,
        $.flagMock,
        {
          ...$.getConversationMock,
          result: {
            data: {
              conversation: {
                ...$.conversation,
                isStarred: true
              }
            }
          }
        }
      ]
    }
  )

  await updates(app)
  app.find('button[aria-label="star"]').simulate("click")
  await updates(app, 10)

  expect(app.find(StarBorder)).toExist()
})

it("un-stars a conversation in conversation view", async () => {
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
            data: { conversation: { ...$.conversation, isStarred: true } }
          }
        },
        $.unFlagMock,
        $.getConversationMock
      ]
    }
  )

  await updates(app)
  app.find('button[aria-label="star"]').simulate("click")
  await updates(app, 10)

  expect(app.find(StarIcon)).toExist()
})
