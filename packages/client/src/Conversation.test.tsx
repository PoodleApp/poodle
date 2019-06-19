import * as React from "react"
import Conversation from "./Conversation"
import * as graphql from "./generated/graphql"
import { delay, mount } from "./testing"

const conversation: graphql.GetConversationQuery["conversation"] = {
  id: "1",
  labels: [],
  presentableElements: [
    {
      id: "11",
      contents: [
        {
          revision: {
            messageId:
              "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>",
            contentId: "text"
          },
          resource: {
            messageId:
              "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>",
            contentId: "text"
          },
          type: "text",
          subtype: "plain",
          content: "Hello from test"
        }
      ],
      date: "2019-06-17T17:20:20.806Z",
      from: {
        name: null,
        mailbox: "jesse",
        host: "sitr.us"
      },
      editedAt: null,
      editedBy: null
    }
  ],
  isRead: false,
  snippet: "Hello from test",
  subject: "Test Thread"
}

const mocks = [
  {
    request: {
      query: graphql.GetConversationDocument,
      variables: { id: conversation.id }
    },
    result: {
      data: {
        conversation
      }
    }
  },
  {
    request: {
      query: graphql.SetIsReadDocument,
      variables: { conversationId: conversation.id, isRead: true }
    },
    result: {
      data: {
        conversation: { ...conversation, isRead: true }
      }
    }
  }
]

it("displays a conversation", async () => {
  const app = mount(<Conversation accountId="1" conversationId="1" />, {
    mocks
  })
  await delay()
  expect(app.text()).toMatch("Hello from test")
})
