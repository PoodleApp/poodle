import { Seq } from "immutable"
import db from "../db"
import { nonNull } from "../util/array"
import { uniqBy } from "../util/immutable"
import { insertInto } from "./helpers"
import { getThread } from "./query"
import { Box, ID, Message, Search, Thread } from "./types"

export function initSearch({
  accountId,
  boxId,
  query
}: {
  accountId: ID
  boxId: ID
  query: string
}): Search {
  const id = insertInto("searches", {
    account_id: accountId,
    box_id: boxId,
    query
  })
  return db.prepare("select * from searches where id = ?").get(id)
}

export function getSearch(params: {
  accountId: ID
  boxId: ID
  query: string
}): Search | null {
  return db
    .prepare(
      `
        select * from searches
        where
          account_id = @accountId and
          box_id = @boxId and
          query = @query
      `
    )
    .get(params)
}

export function addSearchResults({
  search,
  uids,
  updatedAt
}: {
  search: Search
  uids: Iterable<number>
  updatedAt: string
}) {
  db.prepare(
    `
      insert into messages_searches (message_id, search_id, updated_at)
      select id, @searchId, @updatedAt from messages
      where uid in (${Array.from(uids).join(", ")})
      on conflict(message_id, search_id) do update set updated_at = excluded.updated_at
    `
  ).run({ searchId: search.id, updatedAt })
}

export function getSearchedBox(search: Search): Box {
  return db
    .prepare(
      `
        select * from boxes
        join searches on box_id = boxes.id
        where searches.id = ?
      `
    )
    .get(search.id)
}

export function getSearchResults(search: Search): Thread[] {
  const messages: Message[] = db
    .prepare(
      `
        select * from messages
        join messages_searches as link on link.message_id = messages.id
        where link.search_id = @searchId
        order by date desc
      `
    )
    .all({ searchId: search.id })
  const threads = Seq(messages)
    .map(msg => getThread(msg.x_gm_thrid || msg.envelope_messageId))
    .filter(nonNull)
  return uniqBy(thread => thread.id, threads).toArray()
}

export function isSearchFresh(search: Search): boolean {
  const result = db
    .prepare(
      `
        select
          searches.uidlastseen is not null and searches.uidlastseen >= boxes.uidnext - 1 as fresh
        from searches
        join boxes on box_id = boxes.id
        where searches.id = ?
      `
    )
    .get(search.id)
  return result && result.fresh !== 0
}

export function setSearchUidLastSeen(search: Search, uid: number) {
  db.prepare(
    `
      update searches set uidlastseen = @uid
      where id = @searchId
    `
  ).run({ searchId: search.id, uid })
}

export function removeStaleSearchResults(search: Search, updatedAt: string) {
  db.prepare(
    `
      delete from messages_searches
      where search_id = @searchId and updated_at <> @updatedAt
    `
  ).run({ searchId: search.id, updatedAt })
}
