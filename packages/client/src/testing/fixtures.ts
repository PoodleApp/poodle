import * as graphql from "../generated/graphql"

export const conversation: graphql.Conversation = {
  __typename: "Conversation",
  id: "1",
  date: "2019-06-17T17:20:20.806Z",
  from: {
    __typename: "Address",
    name: null,
    mailbox: "jesse",
    host: "sitr.us"
  },
  labels: [],
  replyRecipients: {
    __typename: "Participants",
    to: [
      {
        __typename: "Address",
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
      __typename: "Presentable",
      id: "11",
      isRead: true,
      isStarred: false,
      contents: [
        {
          __typename: "Content",
          revision: {
            __typename: "PartSpec",
            messageId:
              "CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com",
            contentId: "text"
          },
          resource: {
            __typename: "PartSpec",
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
        __typename: "Address",
        name: null,
        mailbox: "jesse",
        host: "sitr.us"
      },
      editedAt: null,
      editedBy: null
    },
    {
      __typename: "Presentable",
      id: "12",
      isRead: true,
      isStarred: false,
      contents: [
        {
          __typename: "Content",
          revision: {
            __typename: "PartSpec",
            messageId:
              "CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA@mail.gmail.com",
            contentId: "replytext"
          },
          resource: {
            __typename: "PartSpec",
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
        __typename: "Address",
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
  __typename: "Account",
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
      conversations: {
        __typename: "ConversationMutations",
        archive: conversation
      }
    }
  }
}

export function flagMock({
  isFlagged,
  conversations = [conversation]
}: {
  conversations?: graphql.Conversation[]
  isFlagged: boolean
}) {
  return {
    request: {
      query: graphql.FlagDocument,
      variables: {
        conversationIDs: conversations
          ? conversations.map(c => c.id)
          : conversation.id,
        isFlagged
      }
    },
    result: {
      data: {
        conversations: {
          __typename: "ConversationMutations",
          flag: conversations
            ? conversations.map(c => ({ ...c, isStarred: isFlagged }))
            : conversation
        }
      }
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
          __typename: "ConversationMutations",
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
      conversations: {
        __typename: "ConversationMutations",
        setIsRead: { ...conversation, isRead: true }
      }
    }
  }
}
