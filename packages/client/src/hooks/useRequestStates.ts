import * as React from "react"
import { ApolloError } from "apollo-client"
import { MutationResult, QueryResult } from "react-apollo"

export default function useRequestStates(
  operationResults: Array<MutationResult | QueryResult>
) {
  const [dismissed, setDismissed] = React.useState<ApolloError[]>([])
  const errors = operationResults.map(r => r.error).filter(nonNull)
  const outstandingErrors = errors.filter(e => !dismissed.includes(e))
  const dismissableErrors = outstandingErrors.map(error => ({
    error,
    onDismiss() {
      const withoutStaleEntries = dismissed.filter(e => errors.includes(e))
      setDismissed([...withoutStaleEntries, error])
    }
  }))
  const loading = operationResults.some(r => r.loading)
  return { dismissableErrors, loading }
}

function nonNull<T>(x: T | null | undefined): x is T {
  return x != null
}
