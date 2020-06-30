import type { MutationResult } from "@apollo/react-common"
import * as React from "react"
import * as graphql from "../generated/graphql"

export default function useSetisRead(
  conversation:
    | {
        id: string
        isRead: boolean
      }
    | null
    | undefined
): MutationResult<graphql.SetIsReadMutation> {
  const [setIsRead, setIsReadResult] = graphql.useSetIsReadMutation()
  React.useEffect(() => {
    if (conversation && !conversation.isRead && !setIsReadResult.called) {
      setIsRead({
        variables: { conversationId: conversation.id!, isRead: true }
      })
    }
  }, [conversation, setIsRead, setIsReadResult])
  return setIsReadResult
}
