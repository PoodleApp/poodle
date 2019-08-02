import { graphql } from "graphql"
import * as cache from "../cache"
import { allMail, testThread } from "../cache/testFixtures"
import db from "../db"
import AccountManager from "../managers/AccountManager"
import { mockConnection } from "../request/testHelpers"
import schema from "../schema"

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
  const result = await request(requestDocument, { accountId, query: "test" })
  expect(result).not.toMatchObject({ errors: expect.anything() })
  expect(result).toMatchObject({
    data: {
      account: {
        search: {
          conversations: [
            {
              presentableElements: [
                {
                  from: { mailbox: "hallettj", host: "gmail.com" },
                  contents: [
                    { content: "<p>This is a test.</p>" },
                    { content: "" }
                  ]
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
  const requestDocument = `
    query search($accountId: ID!, $query: String!) {
      account(id: $accountId) {
        search(query: $query) {
          conversations {
            subject
          }
        }
      }
    }
  `

  await request(requestDocument, { accountId, query: "test" })
  const updatedAt = getUpdatedAt()
  await request(requestDocument, { accountId, query: "test" })
  expect(getUpdatedAt()).toBe(updatedAt)
})

it("gets updated search results if cached results are stale", async () => {
  const requestDocument = `
    query search($accountId: ID!, $query: String!) {
      account(id: $accountId) {
        search(query: $query) {
          conversations {
            subject
          }
        }
      }
    }
  `

  await request(requestDocument, { accountId, query: "test" })
  const updatedAt = getUpdatedAt()

  // Set a signal that upstream state has changed since the search was last run.
  db.prepare("update boxes set uidnext = uidnext + 1").run()

  await request(requestDocument, { accountId, query: "test" })
  expect(getUpdatedAt()).not.toBe(updatedAt)
})

function request(query: string, variables?: Record<string, any>) {
  return graphql(schema, query, null, null, variables)
}

afterEach(async () => {
  db.prepare("delete from accounts").run()
})

function getUpdatedAt() {
  const searches = db
    .prepare("select * from messages_searches group by search_id")
    .all()
  expect(searches.length).toBe(1)
  return searches[0].updated_at
}
