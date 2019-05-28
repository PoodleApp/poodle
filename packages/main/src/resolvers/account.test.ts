import { graphql } from "graphql"
import Connection from "imap"
import keytar from "keytar"
import mailer from "nodemailer"
import { getConnectionFactory } from "../account"
import db from "../db"
import { Account } from "../generated/graphql"
import ConnectionManager from "../managers/ConnectionManager"
import { OAuthCredentials, getAccessToken } from "../oauth"
import schema from "../schema"
import * as sync from "../sync"
import { mock } from "../testHelpers"
import { ConnectionFactory } from "../types"
import * as types from "./types"

jest.mock("keytar")
jest.mock("nodemailer")
jest.mock("../account")
jest.mock("../oauth")

const connection = new Connection({})
const connectionFactory: ConnectionFactory = async () => connection

beforeEach(() => {
  mock(keytar.getPassword).mockResolvedValue(null)
  mock(keytar.setPassword).mockResolvedValue(undefined)
  mock(getConnectionFactory).mockResolvedValue(connectionFactory)
  mock(getAccessToken).mockResolvedValue({ refresh_token: "refresh!" } as any)
  mock(mailer.createTransport as any).mockResolvedValue({})
})

it("gets all accounts", async () => {
  db.insert("accounts", [
    { email: "alice@test.com" },
    { email: "bob@test.com" }
  ])
  const result = await graphql<{ accounts: Account[] }>(
    schema,
    `
      query getAllAccounts {
        accounts {
          id
          email
        }
      }
    `
  )
  expect(result.data).toEqual({
    accounts: expect.arrayContaining([
      { email: "alice@test.com", id: expect.any(String) },
      { email: "bob@test.com", id: expect.any(String) }
    ])
  })
})

it("gets one specific account", async () => {
  const account = testAccount("alice@test.com")

  const result = await graphql(
    schema,
    `
      query getAccount($id: ID!) {
        account(id: $id) {
          id
          email
        }
      }
    `,
    null,
    null,
    { id: account.id }
  )
  expect(result.data).toEqual({
    account: { email: "alice@test.com", id: expect.any(String) }
  })
})

it("adds an account", async () => {
  const result = await graphql(
    schema,
    `
      mutation addAccount($email: String!) {
        accounts {
          create(email: $email) {
            email
            id
            loggedIn
          }
        }
      }
    `,
    null,
    null,
    { email: "eve@test.com" }
  )
  expect(result.data).toEqual({
    accounts: {
      create: {
        email: "eve@test.com",
        id: expect.any(String),
        loggedIn: false
      }
    }
  })
  const accounts = db.query("select * from accounts")
  expect(accounts).toEqual([{ email: "eve@test.com", id: expect.any(Number) }])
})

it("sets up connection for added account if credentials are available", async () => {
  mock(keytar.getPassword).mockImplementation(async (namespace, email) => {
    if (namespace === "Poodle" && email === "eve@test.com") {
      return JSON.stringify({ refresh_token: "refresh!" })
    } else {
      return null
    }
  })

  const result = await graphql(
    schema,
    `
      mutation addAccount($email: String!) {
        accounts {
          create(email: $email) {
            email
            id
            loggedIn
          }
        }
      }
    `,
    null,
    null,
    { email: "eve@test.com" }
  )
  expect(result.data).toEqual({
    accounts: {
      create: {
        email: "eve@test.com",
        id: expect.any(String),
        loggedIn: true
      }
    }
  })
  const accounts = db.query("select * from accounts")
  expect(accounts).toEqual([{ email: "eve@test.com", id: expect.any(Number) }])
})

it("authenticates an account", async () => {
  const account = testAccount("alice@test.com")

  const token = ({ refresh_token: "refresh!" } as any) as OAuthCredentials
  mock(getAccessToken).mockImplementation(async email => {
    if (email !== "alice@test.com") {
      throw new Error(`unexpected email, ${email}`)
    }
    return token
  })

  const result = await graphql(
    schema,
    `
      mutation authenticate($id: ID!) {
        accounts {
          authenticate(id: $id) {
            id
          }
        }
      }
    `,
    null,
    null,
    { id: account.id }
  )
  expect(result).toEqual({
    data: {
      accounts: {
        authenticate: { id: account.id }
      }
    }
  })
})

it("stores credentials in keychain after authentication", async () => {
  const account = testAccount("alice@test.com")

  const token = ({ refresh_token: "refresh!" } as any) as OAuthCredentials
  mock(getAccessToken).mockImplementation(async email => {
    if (email !== "alice@test.com") {
      throw new Error(`unexpected email, ${email}`)
    }
    return token
  })

  await graphql(
    schema,
    `
      mutation authenticate($id: ID!) {
        accounts {
          authenticate(id: $id) {
            id
          }
        }
      }
    `,
    null,
    null,
    { id: account.id }
  )

  expect(keytar.setPassword).toHaveBeenCalledWith(
    "Poodle",
    account.email,
    JSON.stringify(token)
  )
})

it("responds with an error if authentication failed", async () => {
  const account = testAccount("alice@test.com")
  let calledWithEmail

  mock(getAccessToken).mockImplementation(async email => {
    calledWithEmail = email === "alice@test.com"
    throw new Error("could not authenticate")
  })

  const result = await graphql(
    schema,
    `
      mutation authenticate($id: ID!) {
        accounts {
          authenticate(id: $id) {
            id
          }
        }
      }
    `,
    null,
    null,
    { id: account.id }
  )

  expect(calledWithEmail).toBe(true)
  expect(result).toEqual({
    data: null,
    errors: [expect.objectContaining({ message: "could not authenticate" })]
  })
})

it("indicates whether an account is logged in", async () => {
  const account = testAccount("alice@test.com")

  const result = await graphql(
    schema,
    `
      mutation authenticate($accountId: ID!) {
        accounts {
          authenticate(id: $accountId) {
            loggedIn
          }
        }
      }
    `,
    null,
    null,
    { accountId: account.id }
  )
  expect(result).toEqual({
    data: { accounts: { authenticate: { loggedIn: true } } }
  })
})

describe("sync", () => {
  let accountId: string

  beforeEach(async () => {
    ;(sync as any).sync = jest.fn().mockResolvedValue(undefined)
    mock(keytar.getPassword).mockResolvedValue(
      JSON.stringify({ refresh_token: "refresh! " })
    )
    const createResult = await graphql(
      schema,
      `
        mutation createAccount($email: String!) {
          accounts {
            create(email: $email) {
              id
            }
          }
        }
      `,
      null,
      null,
      { email: "eve@test.com" }
    )
    accountId = createResult.data!.accounts.create.id
  })

  it("syncs an account", async () => {
    const syncResult = await graphql(
      schema,
      `
        mutation sync($id: ID!) {
          accounts {
            sync(id: $id) {
              id
            }
          }
        }
      `,
      null,
      null,
      { id: accountId }
    )
    expect(syncResult).toMatchObject({
      data: { accounts: { sync: { id: accountId } } }
    })
    expect(sync.sync).toHaveBeenCalledWith(
      accountId,
      expect.any(ConnectionManager)
    )
  })
})

afterEach(() => {
  jest.clearAllMocks()
  db.prepare("delete from accounts").run()
})

function testAccount(email: string): types.Account {
  const { lastInsertRowid: accountId } = db
    .prepare("insert into accounts (email) values (?)")
    .run("alice@test.com")
  return { id: String(accountId), email }
}
