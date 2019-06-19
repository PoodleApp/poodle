import * as React from "react"
import Conversation from "./Conversation"
import * as graphql from "./generated/graphql"
import { delay, mount } from "./testing"

const conversation: graphql.Conversation = {
  id: "1",
  date: "2019-06-17T17:20:20.806Z",
  from: {
    name: null,
    mailbox: "jesse",
    host: "sitr.us"
  },
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

const getConversationMock = {
  request: {
    query: graphql.GetConversationDocument,
    variables: { id: conversation.id }
  },
  result: {
    data: {
      conversation
    }
  }
}

const setIsReadMock = {
  request: {
    query: graphql.SetIsReadDocument,
    variables: { conversationId: conversation.id, isRead: true }
  },
  result: {
    data: {
      conversations: { setIsRead: { ...conversation, isRead: true } }
    }
  }
}

it("displays a conversation", async () => {
  const mocks = [getConversationMock, setIsReadMock]
  const app = mount(
    <Conversation accountId="1" conversationId={conversation.id} />,
    {
      mocks
    }
  )
  await delay()
  expect(app.text()).toMatch("Hello from test")
})

it("displays a loading indicator while the conversation is leading", () => {
  const mocks = [getConversationMock, setIsReadMock]
  const app = mount(
    <Conversation accountId="1" conversationId={conversation.id} />,
    {
      mocks
    }
  )
  expect(app.text()).toMatch("Loading...")
})

// it("marks conversation as read", async () => {
//   const mocks = [getConversationMock]
//   const app = mount(
//     <Conversation accountId="1" conversationId={conversation.id} />,
//     {
//       mocks,
//       resolvers: {
//         Mutation: {
//           conversations: {
//             setIsRead(
//               _parent: any,
//               { id, isRead }: { id: string; isRead: boolean }
//             ) {
//               console.log("called setIsRead", id, isRead)
//               return { ...conversation, isRead: true }
//             }
//           }
//         }
//       } as any
//     }
//   )
//   await delay()
// })
