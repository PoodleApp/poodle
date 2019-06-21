import * as graphql from "../generated/graphql"

export const conversation: graphql.Conversation = {
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

export const getConversationMock = {
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

export const account: graphql.Account = {
  id: "1",
  conversations: [conversation],
  email: "jesse@sitr.us",
  loggedIn: true,
  messages: []
}

export const getAccountMock = {
  request: {
    query: graphql.GetAccountDocument,
    variables: { accountId: account.id }
  },
  result: {
    data: {
      account
    }
  }
}

export const archiveMock = {
  request: {
    query: graphql.ArchiveDocument,
    variables: { conversationId: conversation.id }
  },
  result: {
    data: {
      conversations: { archive: conversation }
    }
  }
}

export const setIsReadMock = {
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