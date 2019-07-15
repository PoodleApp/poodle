import { graphql } from "graphql"
import * as cache from "../cache"
import { testThread } from "../cache/testFixtures"
import db from "../db"
import schema from "../schema"

afterEach(() => {
  jest.clearAllMocks()
  db.prepare("delete from accounts").run()
})

let accountId: cache.ID
let messageId: cache.ID

beforeEach(() => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid
  messageId = cache.persistAttributes(
    { accountId, updatedAt: new Date().toISOString() },
    testThread[0].attributes
  )
})

it("gets addresses that match some input value", async () => {
  db.insert("message_participants", [
    {
      name: "Alice",
      host: "test.com",
      mailbox: "alice",
      type: "to",
      message_id: messageId
    },
    {
      name: "Bob",
      host: "test.com",
      mailbox: "bob",
      type: "to",
      message_id: messageId
    }
  ])
  const result = await graphql(
    schema,
    `
      query getAllParticipants($value: String!) {
        addresses(inputValue: $value) {
          host
          mailbox
          name
        }
      }
    `,
    null,
    null,
    { value: "bob" }
  )
  expect(result).toEqual({
    data: {
      addresses: [{ name: "Bob", host: "test.com", mailbox: "bob" }]
    }
  })
})

it("should get a single result per email address when the same person is listed multiple times", async () => {
  db.insert("message_participants", [
    {
      name: "Bob",
      host: "test.com",
      mailbox: "bob",
      type: "to",
      message_id: messageId
    },
    {
      name: "Bob",
      host: "test.com",
      mailbox: "bob",
      type: "to",
      message_id: messageId
    },
    {
      name: "Bob",
      host: "originate.com",
      mailbox: "bob",
      type: "to",
      message_id: messageId
    }
  ])
  const result = await graphql(
    schema,
    `
      query getAllParticipants($value: String!) {
        addresses(inputValue: $value) {
          host
          mailbox
          name
        }
      }
    `,
    null,
    null,
    { value: "Bob" }
  )
  expect(result).toEqual({
    data: {
      addresses: [
        { name: "Bob", host: "originate.com", mailbox: "bob" },
        { name: "Bob", host: "test.com", mailbox: "bob" }
      ]
    }
  })
})

it("should should be consistently ordered", async () => {
  db.insert("message_participants", [
    {
      name: "Bob",
      host: "test.com",
      mailbox: "bob",
      type: "to",
      message_id: messageId
    },
    {
      name: "Bob",
      host: "test.com",
      mailbox: "bobofous",
      type: "to",
      message_id: messageId
    },
    {
      name: "Bob",
      host: "test.com",
      mailbox: "bobby",
      type: "to",
      message_id: messageId
    }
  ])
  const result = await graphql(
    schema,
    `
      query getAllParticipants($value: String!) {
        addresses(inputValue: $value) {
          host
          mailbox
          name
        }
      }
    `,
    null,
    null,
    { value: "bob" }
  )
  expect(result).toEqual({
    data: {
      addresses: [
        { name: "Bob", mailbox: "bob", host: "test.com" },
        { name: "Bob", host: "test.com", mailbox: "bobby" },
        { name: "Bob", host: "test.com", mailbox: "bobofous" }
      ]
    }
  })
})

it("should allow for a participant name to be null", async () => {
  db.insert("message_participants", [
    {
      name: null,
      host: "test.com",
      mailbox: "bob",
      type: "to",
      message_id: messageId
    }
  ])
  const result = await graphql(
    schema,
    `
      query getAllParticipants($value: String!) {
        addresses(inputValue: $value) {
          host
          mailbox
          name
        }
      }
    `,
    null,
    null,
    { value: "bob" }
  )
  expect(result).toEqual({
    data: {
      addresses: [{ name: null, host: "test.com", mailbox: "bob" }]
    }
  })
})
