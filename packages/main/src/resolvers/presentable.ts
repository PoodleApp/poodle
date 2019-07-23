import {
  MutationResolvers,
  PresentableMutationsResolvers
} from "../generated/graphql"
import * as C from "../models/conversation"
import { actions, schedule } from "../queue"
import { updateAction } from "./conversation"

export const PresentableMutations: PresentableMutationsResolvers = {
  async flagPresentable(_parent, { conversationId, id, isFlagged }) {
    const thread = C.mustGetConversation(conversationId)
    const presentables = C.getPresentableElements(thread)
    for (const message of thread.messages) {
      if (String(message.id) === id) {
        updateAction([message], (accountId, box, uids) => {
          schedule(
            actions.setFlagged({
              accountId: String(accountId),
              box,
              uids,
              isFlagged
            })
          )
        })
      }
    }
    for (const presentable of presentables) {
      if (presentable.id === id) {
        return presentable
      }
    }
    return null
  }
}

export const mutations: Partial<MutationResolvers> = {
  presentableElements(_parent, params) {
    return params
  }
}
