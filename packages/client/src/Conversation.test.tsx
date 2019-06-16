import * as React from "react"
import Conversation from "./Conversation"
import * as graphql from "./generated/graphql"
import { mount } from "./testHelpers"

const conversation: graphql.GetConversationQuery = {
  id: "1"
}

const mocks = [
  {
    request: {
      query: graphql.GetConversationDocument,
      variables: { converationId: conversation.id }
    },
    result: {
      data: {
        conversation
      }
    }
  }
]

it("displays a conversation", () => {
  const app = mount(<Conversation accountId="1" conversationId="1" />, {
    mocks
  })
})
