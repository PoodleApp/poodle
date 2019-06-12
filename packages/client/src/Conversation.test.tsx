import * as React from "react"
import { MockedProvider } from "react-apollo/test-utils"
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
  const app = mount(
    <MockedProvider mocks={mocks} addTypename={false}>
      <Conversation accountId="1" conversationId="1" />
    </MockedProvider>
  )
})
