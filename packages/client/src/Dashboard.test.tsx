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
    mocks: [$.getAccountMock, $.flagMock({ isFlagged: true })]
  })

  await updates(app)
  app.find(Avatar).simulate("click")
  app.find('button[aria-label="star"]').simulate("click")
  await updates(app, 10)

  expect(app.find(ListItemText)).toIncludeText("⭐ ")
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
      $.flagMock({ isFlagged: false })
    ]
  })

  await updates(app)
  app.find(Avatar).simulate("click")
  app.find('button[aria-label="unstar"]').simulate("click")
  await updates(app, 10)

  expect(app.find(ListItemText)).not.toIncludeText("⭐ ")
})

it("stars selected conversations when some are unstarred", async () => {
  const app = mount(<Dashboard accountId={$.account.id} />, {
    mocks: [
      {
        ...$.getAccountMock,
        result: {
          data: {
            account: {
              ...$.account,
              conversations: [
                { ...$.conversation, id: "2" },
                { ...$.conversation, isStarred: true }
              ]
            }
          }
        }
      },
      $.flagMock({
        isFlagged: true,
        conversations: [{ ...$.conversation, id: "2" }, $.conversation]
      })
    ]
  })

  await updates(app)

  app.find(Avatar).forEach(node => node.simulate("click"))
  app.find('button[aria-label="star"]').simulate("click")

  await updates(app, 10)

  expect(
    app
      .find(ListItemText)
      .filterWhere(node => node.prop("id") === "conversation-row-1")
  ).toIncludeText("⭐ ")
  expect(
    app
      .find(ListItemText)
      .filterWhere(node => node.prop("id") === "conversation-row-2")
  ).toIncludeText("⭐ ")
})

it("unstars selected conversations when all are starred", async () => {
  const app = mount(<Dashboard accountId={$.account.id} />, {
    mocks: [
      {
        ...$.getAccountMock,
        result: {
          data: {
            account: {
              ...$.account,
              conversations: [
                { ...$.conversation, id: "2", isStarred: true },
                { ...$.conversation, isStarred: true }
              ]
            }
          }
        }
      },
      $.flagMock({
        isFlagged: false,
        conversations: [{ ...$.conversation, id: "2" }, $.conversation]
      })
    ]
  })

  await updates(app)

  app.find(Avatar).forEach(node => node.simulate("click"))
  app.find('button[aria-label="unstar"]').simulate("click")

  await updates(app, 10)

  expect(
    app
      .find(ListItemText)
      .filterWhere(node => node.prop("id") === "conversation-row-1")
  ).not.toIncludeText("⭐ ")
  expect(
    app
      .find(ListItemText)
      .filterWhere(node => node.prop("id") === "conversation-row-2")
  ).not.toIncludeText("⭐ ")
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
  app.find('button[aria-controls="star-11"]').simulate("click")
  await updates(app, 100)

  expect(app.find(StarBorder)).toExist()
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
  app.find('button[aria-controls="star-11"]').simulate("click")
  await updates(app, 15)

  expect(app.find(StarIcon)).toExist()
})
