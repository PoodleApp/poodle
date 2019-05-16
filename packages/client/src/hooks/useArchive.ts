import * as graphql from "../generated/graphql"

export default function useArchive(variables: {
  accountId: string
  conversationId: string
}) {
  return graphql.useArchiveMutation({
    refetchQueries() {
      return [{ query: graphql.GetAccountDocument, variables }]
    },
    variables
  })
}
