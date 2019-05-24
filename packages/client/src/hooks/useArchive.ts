import * as graphql from "../generated/graphql"

export default function useArchive({
  accountId,
  conversationId
}: {
  accountId: string
  conversationId?: string
}) {
  return graphql.useArchiveMutation({
    refetchQueries() {
      return [{ query: graphql.GetAccountDocument, variables: { accountId } }]
    },
    variables: conversationId ? { conversationId } : undefined
  })
}
