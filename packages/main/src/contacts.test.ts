import { google } from "googleapis"
import { ID } from "./cache/types"
import ContactsApiClient from "./contacts"
import db from "./db"
import { mock, testAccount } from "./testHelpers"

jest.mock("googleapis")

let listMock: jest.Mock

let accountId: ID

beforeEach(() => {
  listMock = jest.fn()

  mock(google.people).mockImplementation(() => {
    return {
      people: {
        connections: { list: listMock }
      }
    } as any
  })
  const account = testAccount("jack@test.com")
  accountId = account.id
})

it("calls list", async () => {
  listMock.mockResolvedValue({
    data: {
      connections: [
        {
          emailAddresses: [
            { value: "ben.reitman@gmail.com", displayName: "Ben Reitman" }
          ]
        }
      ],
      nextSyncToken: "xe987nsds"
    }
  })
  const client = new ContactsApiClient({} as any)

  await client.downloadContacts(accountId)

  expect(listMock).toHaveBeenCalledWith({
    personFields: "names,emailAddresses",
    resourceName: "people/me",
    requestSyncToken: true,
    syncToken: null
  })
})

it("inserts each user's connection into the google_connections database", async () => {
  listMock.mockResolvedValue({
    data: {
      connections: [
        {
          emailAddresses: [{ value: "ben.reitman@gmail.com" }],
          names: [{ displayName: "Ben Reitman" }]
        }
      ],
      nextSyncToken: "xe987nsds"
    }
  })
  const client = new ContactsApiClient({} as any)

  await client.downloadContacts(accountId)

  const result = db.prepare("select * from google_connections").all()

  expect(result).toEqual([
    {
      id: accountId,
      account_id: accountId,
      host: "gmail.com",
      mailbox: "ben.reitman",
      name: "Ben Reitman"
    }
  ])
})

it("should allow for a contact's name to be null", async () => {
  listMock.mockResolvedValue({
    data: {
      connections: [
        { emailAddresses: [{ value: "ben.reitman@gmail.com" }], names: [] }
      ],
      nextSyncToken: "xe987nsds"
    }
  })
  const client = new ContactsApiClient({} as any)

  await client.downloadContacts(accountId)

  const result = db.prepare("select * from google_connections").all()

  expect(result).toEqual([
    {
      id: accountId,
      account_id: accountId,
      host: "gmail.com",
      mailbox: "ben.reitman",
      name: null
    }
  ])
})

it("skips contacts whose email addresses cannot be parsed", async () => {
  listMock.mockResolvedValue({
    data: {
      connections: [{ emailAddresses: [{ value: "Ben Reitman" }], names: [] }],
      nextSyncToken: "xe987nsds"
    }
  })
  const client = new ContactsApiClient({} as any)

  await client.downloadContacts(accountId)

  const result = db.prepare("select * from google_connections").all()

  expect(result).toEqual([])
})

it("should include the syncToken when requesting from the API twice", async () => {
  listMock.mockResolvedValue({
    data: {
      connections: [
        {
          emailAddresses: [{ value: "ben.reitman@gmail.com" }],
          names: [{ displayName: "Ben Reitman" }]
        }
      ],
      nextSyncToken: "xe987nsds"
    }
  })
  const client = new ContactsApiClient({} as any)

  await client.downloadContacts(accountId)

  listMock.mockResolvedValue({
    data: {
      connections: [
        {
          emailAddresses: [
            { value: "ben.reitman@gmail.com", displayName: "Ben Reitman" }
          ]
        },
        {
          emailAddresses: [{ value: "ben@test.com", displayName: "Ben Reit" }],
          names: [{ displayName: "Ben Reitman" }]
        }
      ],
      nextSyncToken: "fe4vdopow"
    }
  })

  const result = db.prepare("select * from accounts").all()

  expect(result).toEqual([
    { id: accountId, email: "jack@test.com", Google_API_syncToken: "xe987nsds" }
  ])
})

afterEach(() => {
  jest.clearAllMocks()
  db.prepare("delete from accounts").run()
})
