import { graphql } from "graphql"
import * as cache from "../cache"
import { allMail, testThread } from "../cache/testFixtures"
import db from "../db"
import AccountManager from "../managers/AccountManager"
import { delay } from "../testHelpers"
import { mockConnection } from "../request/testHelpers"
import schema from "../schema"
import getIn from "lodash/get"

jest.mock("imap")

let accountId: cache.ID

beforeEach(async () => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid

  db.prepare(
    `
      insert into boxes
      (account_id, name, uidvalidity) values
      (@accountId, @name, @uidvalidity)
    `
  ).run({ ...allMail, accountId })

  const connectionManager = mockConnection({
    thread: testThread,
    searchResults: [[[["X-GM-RAW", "test"]], [testThread[0].attributes.uid!]]]
  })
  AccountManager.connectionManagers[String(accountId)] = connectionManager
})

it("searches for conversations", async () => {
  const result = await waitForSearchResults({ accountId, query: "test" })
  expect(result).toMatchObject({
    data: {
      account: {
        search: {
          conversations: [
            {
              presentableElements: [
                {
                  from: { mailbox: "hallettj", host: "gmail.com" },
                  contents: [{ content: "<p>This is a test.</p>" }]
                },
                {
                  from: { mailbox: "jesse", host: "sitr.us" },
                  contents: [{ content: "A reply appears." }]
                }
              ],
              subject: "Test thread 2019-02"
            }
          ]
        }
      }
    }
  })
})

it("uses cached results on subsequent requests", async () => {
  await waitForSearchResults({ accountId, query: "test" })
  const updatedAt = getUpdatedAt()
  await waitForSearchResults({ accountId, query: "test" })
  expect(getUpdatedAt()).toBe(updatedAt)
})

it("gets updated search results if cached results are stale", async () => {
  await waitForSearchResults({ accountId, query: "test" })
  const updatedAt = getUpdatedAt()

  // Set a signal that upstream state has changed since the search was last run.
  db.prepare("update boxes set uidnext = uidnext + 1").run()
  await waitForSearchResults({ accountId, query: "test" })

  expect(getUpdatedAt()).not.toBe(updatedAt)
})

afterEach(async () => {
  db.prepare("delete from accounts").run()
})

function request(query: string, variables?: Record<string, any>) {
  return graphql(schema, query, null, null, variables)
}

async function waitForSearchResults(variables: object) {
  const requestDocument = `
    query search($accountId: ID!, $query: String!) {
      account(id: $accountId) {
        search(query: $query) {
          conversations {
            presentableElements {
              contents {
                content
              }
              from {
                mailbox
                host
              }
            }
            subject
          }
        }
      }
    }
  `

  // The first request schedules the search; a subsequent request gets results
  // when they are ready.
  await request(requestDocument, variables)
  let result
  do {
    await delay(10)
    result = await request(requestDocument, variables)
  } while (
    getIn(result, [
      "data",
      "account",
      "search",
      "conversations",
      0,
      "presentableElements",
      1,
      "contents",
      0,
      "content"
    ]) !== "A reply appears."
  )

  expect(result).not.toMatchObject({ errors: expect.anything() })
  return result!
}

function getUpdatedAt() {
  const searches = db
    .prepare("select * from messages_searches group by search_id")
    .all()
  expect(searches.length).toBe(1)
  return searches[0].updated_at
}
