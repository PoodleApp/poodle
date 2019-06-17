import * as graphql from "../generated/graphql"

export default function useSync(variables: { accountId: string }) {
  return graphql.useSyncMutation({
    refetchQueries() {
      return [{ query: graphql.GetAccountDocument, variables }]
    },
    variables
  })
}
