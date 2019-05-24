/* eslint-disable default-case */

import * as React from "react"
import * as graphql from "../generated/graphql"

type Conversation = NonNullable<
  graphql.GetAccountQuery["account"]
>["conversations"][number]

export type Action =
  | { type: "select"; conversationId: string }
  | { type: "unselect"; conversationId: string }
  | { type: "reset"; conversationIds: string[] }

export function select(conversationId: string): Action {
  return { type: "select", conversationId }
}

export function unselect(conversationId: string): Action {
  return { type: "unselect", conversationId }
}

export function reset(conversationIds: string[]): Action {
  return { type: "reset", conversationIds }
}

function reducer(selected: string[], action: Action): string[] {
  switch (action.type) {
    case "select":
      return selected.concat(action.conversationId)
    case "unselect":
      return selected.filter(id => id !== action.conversationId)
    case "reset":
      return action.conversationIds
  }
}

export function useSelectedConversations(
  conversations?: Conversation[] | null
): [string[], (action: Action) => void] {
  const [selected, dispatch] = React.useReducer(reducer, [])
  React.useEffect(() => {
    const conversationIds = selected.filter(id =>
      conversations
        ? conversations.some(conversation => id === conversation.id)
        : false
    )
    dispatch({ type: "reset", conversationIds })
  }, [conversations, selected])
  return [selected, dispatch]
}
