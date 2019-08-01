import * as cache from "../cache"
import { SearchResolvers } from "../generated/graphql"

export const Search: SearchResolvers = {
  conversations(search: cache.Search) {
    return cache.getSearchResults(search)
  },

  loading(search: cache.Search) {
    return !cache.isSearchFresh(search)
  }
}
