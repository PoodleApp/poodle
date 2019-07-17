import { graphql } from "graphql"
import * as cache from "../cache"
import { inbox, testThread } from "../cache/testFixtures"
import db from "../db"
import schema from "../schema"
import { idFromHeaderValue } from "poodle-common/lib/models/uri"

let accountId: cache.ID

beforeEach(() => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values(?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid
  const boxId = cache.persistBoxState(accountId, inbox)
  for (const message of testThread) {
    const id = cache.persistAttributes({ accountId, boxId }, message.attributes)
    cache.persistHeadersAndReferences(id, message.headers, message.attributes)
  }
})

it("gets messages from cache", async () => {
  const result = await graphql(
    schema,
    `
      query getMessages($accountId: ID!) {
        account(id: $accountId) {
          messages {
            date
            messageId
            subject
            from {
              name
              mailbox
              host
            }
          }
        }
      }
    `,
    null,
    null,
    { accountId }
  )
  expect(result).toMatchObject({
    data: {
      account: {
        messages: [
          {
            date: testThread[0].attributes.date.toISOString(),
            messageId: idFromHeaderValue(
              testThread[0].attributes.envelope.messageId
            ),
            subject: "Test thread 2019-02",
            from: [
              { name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }
            ]
          },
          {
            date: testThread[1].attributes.date.toISOString(),
            messageId: idFromHeaderValue(
              testThread[1].attributes.envelope.messageId
            ),
            subject: "Re: Test thread 2019-02",
            from: [{ name: "Jesse Hallett", mailbox: "jesse", host: "sitr.us" }]
          }
        ]
      }
    }
  })
})
