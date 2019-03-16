import * as React from "react"
import * as graphql from "../generated/graphql"

export default function useSync({ accountId }: { accountId: string }) {
  const _sync = graphql.useSyncMutation({
    update(cache, response) {
      if (response.data) {
        cache.writeQuery({
          query: graphql.GetAccountDocument,
          variables: { accountId },
          data: { account: response.data.accounts.sync }
        })
      }
    },
    variables: { accountId }
  })
  const [loading, setLoading] = React.useState(0)
  async function sync() {
    try {
      setLoading(s => s + 1)
      return await _sync()
    } finally {
      setLoading(s => Math.max(s - 1, 0))
    }
  }
  return { loading: loading > 0, sync }
}
