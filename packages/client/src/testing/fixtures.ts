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
  replyRecipients: {
    to: [
      {
        name: null,
        mailbox: "jesse",
        host: "sitr.us"
      }
    ],
    from: [],
    cc: []
  },
  presentableElements: [
    {
      id: "11",
      isRead: true,
      isStarred: false,
      contents: [
        {
          revision: {
            messageId:
              "CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com",
            contentId: "text"
          },
          resource: {
            messageId:
              "CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com",
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
    },
    {
      id: "12",
      isRead: true,
      isStarred: false,
      contents: [
        {
          revision: {
            messageId:
              "CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA@mail.gmail.com",
            contentId: "replytext"
          },
          resource: {
            messageId:
              "CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA@mail.gmail.com",
            contentId: "replytext"
          },
          type: "text",
          subtype: "plain",
          content: "Hello from next test"
        }
      ],
      date: "2019-07-17T17:20:20.806Z",
      from: {
        name: null,
        mailbox: "ben",
        host: "test.us"
      },
      editedAt: null,
      editedBy: null
    }
  ],
  isStarred: false,
  isRead: true,
  snippet: "Hello from test",
  subject: "Test Thread"
}

export const account: graphql.Account = {
  id: "1",
  conversations: [conversation],
  email: "jesse@sitr.us",
  loggedIn: true,
  messages: []
}

export const getConversationMock = {
  request: {
    query: graphql.GetConversationDocument,
    variables: { id: conversation.id, accountId: account.id }
  },
  result: {
    data: {
      conversation
    }
  }
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

export const flagMock = {
  request: {
    query: graphql.FlagDocument,
    variables: { conversationId: conversation.id }
  },
  result: {
    data: {
      conversations: { flag: { ...conversation, isStarred: true } }
    }
  }
}

export function replyMock(content: string) {
  return {
    request: {
      query: graphql.ReplyDocument,
      variables: {
        accountId: account.id,
        conversationId: conversation.id,
        content: {
          type: "text",
          subtype: "html",
          content
        }
      }
    },
    result: {
      data: {
        conversations: {
          reply: conversation
        }
      }
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
