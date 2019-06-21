import { Resolvers, Address } from "../generated/graphql"
import * as account from "./account"
import * as conversation from "./conversation"
import * as message from "./message"
import db from "../db"

export const resolvers: Resolvers = {
  Query: {
    ...account.queries,
    ...conversation.queries,
    addresses(_parent, variables): Address[] {
      const length = db
        .prepare("select count() as contactCount from google_connections")
        .get()

      return length <= 1
        ? db
            .prepare(
              `
          select name,mailbox,host from message_participants 
            where printf('%s %s@%s',name,mailbox,host) like '%' || @inputValue  || '%' 
            group by mailbox,host 
            order by name,mailbox,host
          `
            )
            .all({
              inputValue: variables.inputValue
            })
        : db
            .prepare(
              `
          select name,mailbox,host from google_connections 
            where printf('%s %s@%s',name,mailbox,host) like '%' || @inputValue  || '%' 
            group by mailbox,host 
            order by name,mailbox,host
          `
            )
            .all({
              inputValue: variables.inputValue
            })
    }
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
