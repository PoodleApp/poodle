import { Resolvers } from "../generated/graphql"
import * as account from "./account"
import * as conversation from "./conversation"
import * as message from "./message"

export const resolvers: Resolvers = {
  Query: {
    ...account.queries,
    ...conversation.queries
  },
  Mutation: {
    ...account.mutations,
    ...conversation.mutations
  },
  Account: account.Account,
  AccountMutations: account.AccountMutations,
  Conversation: conversation.Conversation,
  ConversationMutations: conversation.ConversationMutations,
  Message: message.Message
}
