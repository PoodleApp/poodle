import Connection from "imap"
import { inbox, testThread } from "../cache/testFixtures"
import { mock } from "../testHelpers"
import * as kefirUtil from "../util/kefir"
import { actions, isBody, isHeaders, isMessage, perform } from "./index"
import { mockFetchImplementation } from "./testHelpers"

jest.mock("imap")

let connection: Connection

beforeEach(() => {
  mock(Connection.prototype.fetch).mockImplementation(mockFetchImplementation())
  connection = new Connection({})
  connection.state = "connected"
  ;(connection as any)._box = inbox
})

it("gets a list of mailboxes", async () => {
  const boxes = {
    INBOX: { attribs: ["\\Inbox"] }
  }
  mock(Connection.prototype.getBoxes).mockImplementation((cb: any) => {
    cb(null, boxes)
  })
  expect(await perform(connection, actions.getBoxes()).toPromise()).toEqual(
    boxes
  )
})

it("fetches a message", async () => {
  const testMessage = testThread[0]
  expect(
    await perform(
      connection,
      actions.fetch({ name: "INBOX" }, String(testMessage.attributes.uid), {
        bodies: "HEADER",
        envelope: true,
        struct: true
      })
    )
      .filter(isMessage)
      .toPromise()
  ).toEqual({
    type: "Message",
    attributes: testMessage.attributes
  })
})

it("fetches message headers", async () => {
  const testMessage = testThread[0]
  expect(
    await perform(
      connection,
      actions.fetch({ name: "INBOX" }, String(testMessage.attributes.uid), {
        bodies: "HEADER",
        envelope: true,
        struct: true
      })
    )
      .filter(isHeaders)
      .toPromise()
  ).toEqual({
    type: "Headers",
    messageAttributes: testMessage.attributes,
    headers: expect.arrayContaining([
      ["subject", testMessage.attributes.envelope.subject]
    ])
  })
})

it("fetches content for message parts", async () => {
  const results = await kefirUtil
    .takeAll(
      perform(
        connection,
        actions.fetch({ name: "INBOX" }, `${testThread[0].attributes.uid}`, {
          bodies: ["3", "4"],
          envelope: true,
          struct: true
        })
      )
        .filter(isBody)
        .map(e => ({ ...e, data: e.data.toString("utf8") }))
    )
    .toPromise()
  expect(results).toEqual(
    expect.arrayContaining([
      {
        type: "Body",
        messageAttributes: testThread[0].attributes,
        which: "3",
        size: 15,
        data: "This is a test."
      },
      {
        type: "Body",
        messageAttributes: testThread[0].attributes,
        which: "4",
        size: 22,
        data: "<p>This is a test.</p>"
      }
    ])
  )
})

afterEach(() => {
  jest.restoreAllMocks()
})
