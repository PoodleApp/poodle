import eol from "eol"
import Connection from "imap"
import Mailer from "nodemailer/lib/mailer"
import * as cache from "../cache"
import { allMail, testThread } from "../cache/testFixtures"
import { composeReply } from "../compose"
import db from "../db"
import AccountManager from "../managers/AccountManager"
import { mockConnection, mockSmtpTransporters } from "../request/testHelpers"
import { sync } from "../sync"
import { mock } from "../testHelpers"
import * as queue from "./index"

jest.mock("imap")
jest.mock("nodemailer/lib/mailer")

let accountId: cache.ID

beforeEach(async () => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid

  const connectionManager = mockConnection({
    thread: [
      {
        attributes: { ...testThread[0].attributes, flags: ["\\Answered"] },
        headers: testThread[0].headers
      },
      {
        attributes: { ...testThread[1].attributes, flags: [] },
        headers: testThread[1].headers
      }
    ]
  })

  AccountManager.connectionManagers[String(accountId)] = connectionManager
  AccountManager.smtpTransporters[String(accountId)] = mockSmtpTransporters()

  await sync(accountId, connectionManager)
})

it("marks a conversation as read", async () => {
  const promise = queue.enqueue(
    queue.actions.markAsRead({
      accountId: String(accountId),
      box: allMail,
      uids: [7687]
    })
  )
  const flags = db
    .prepare(
      `
        select flag from message_flags
        join messages on message_id = messages.id
        where
          uid = @uid
      `
    )
    .all({ uid: 7687 })
  expect(flags).toEqual([{ flag: "\\Seen" }])
  await promise
  expect(Connection.prototype.addFlags).toHaveBeenCalledWith(
    [7687],
    ["\\Seen"],
    expect.any(Function)
  )
})

it("marks a conversation as unread", async () => {
  const connectionManager = mockConnection()
  await sync(accountId, connectionManager)

  const promise = queue.enqueue(
    queue.actions.unmarkAsRead({
      accountId: String(accountId),
      box: allMail,
      uids: [7687]
    })
  )
  const flags = db
    .prepare(
      `
        select flag from message_flags
        join messages on message_id = messages.id
        where
          uid = @uid
      `
    )
    .all({ uid: 7687 })
  expect(flags).toEqual([])
  await promise
  expect(Connection.prototype.delFlags).toHaveBeenCalledWith(
    [7687],
    ["\\Seen"],
    expect.any(Function)
  )
})

it.skip("replaces pending read status change when a new change is queued", async () => {
  // pause queue
  const connectionManager = AccountManager.connectionManagers[String(accountId)]
  delete AccountManager.connectionManagers[String(accountId)]

  const promise1 = queue.enqueue(
    queue.actions.markAsRead({
      accountId: String(accountId),
      box: allMail,
      uids: [7687]
    })
  )
  const promise2 = queue.enqueue(
    queue.actions.unmarkAsRead({
      accountId: String(accountId),
      box: allMail,
      uids: [7687]
    })
  )

  // resume queue
  AccountManager.connectionManagers[String(accountId)] = connectionManager

  queue.queue.resume()
  const flags = db
    .prepare(
      `
        select flag from message_flags
        join messages on message_id = messages.id
        where
          uid = @uid
      `
    )
    .all({ uid: 7687 })
  expect(flags).toEqual([])
  await Promise.all([promise1, promise2])
  expect(Connection.prototype.addFlags).not.toHaveBeenCalled()
})

it("sends a message", async () => {
  const conversation = cache.getThreads(accountId)[0]
  const account = cache.getAccount(accountId)!
  const content = {
    type: "text",
    subtype: "plain",
    content: "howdy"
  }
  const message = composeReply({ account, content, conversation })
  message.attributes.date = new Date("2019-05-21T18:51Z")
  const promise = queue.enqueue(
    queue.actions.sendMessage({ accountId: String(accountId), message })
  )

  expect(cache.getThreads(accountId)[0]).toMatchObject({
    messages: [
      { uid: 7467, envelope_subject: "Test thread 2019-02" },
      { uid: 7687, envelope_subject: "Re: Test thread 2019-02" },
      { uid: null, envelope_subject: "Re: Test thread 2019-02" }
    ]
  })

  await promise
  expect(Mailer.prototype.sendMail).toHaveBeenCalledTimes(1)
  expect(
    mock(Mailer.prototype.sendMail).mock.calls[0][0].raw!.toString("utf8")
  ).toBe(
    eol.crlf(
      `
Content-Type: text/plain; charset=UTF-8
Content-Length: 5
Message-ID: ${message.attributes.envelope.messageId}
From: jesse@sitr.us
To: Jesse Hallett <hallettj@gmail.com>
Subject: Re: Test thread 2019-02
In-Reply-To:
 <CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA@mail.gmail.com>
References:
 <CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>
 <CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA@mail.gmail.com>
Content-Transfer-Encoding: quoted-printable
Date: Tue, 21 May 2019 18:51:00 +0000
MIME-Version: 1.0

howdy
      `.trim()
    )
  )
  expect(mock(Mailer.prototype.sendMail).mock.calls[0][0].envelope).toEqual({
    from: "jesse@sitr.us",
    to: ["hallettj@gmail.com"]
  })
})

it("removes cached message if message cannot be sent", async () => {
  mock(Mailer.prototype.sendMail).mockImplementation(async () => {
    throw new Error("message could not be delivered")
  })

  const conversation = cache.getThreads(accountId)[0]
  const account = cache.getAccount(accountId)!
  const content = {
    type: "text",
    subtype: "plain",
    content: "howdy"
  }
  const message = composeReply({ account, content, conversation })
  message.attributes.date = new Date("2019-05-21T18:51Z")
  const promise = queue.enqueue(
    queue.actions.sendMessage({ accountId: String(accountId), message })
  )

  expect(cache.getThreads(accountId)[0]).toMatchObject({
    messages: [
      { uid: 7467, envelope_subject: "Test thread 2019-02" },
      { uid: 7687, envelope_subject: "Re: Test thread 2019-02" },
      { uid: null, envelope_subject: "Re: Test thread 2019-02" }
    ]
  })

  try {
    await promise
  } catch (_) {}

  expect(cache.getThreads(accountId)[0]).toMatchObject({
    messages: [
      { uid: 7467, envelope_subject: "Test thread 2019-02" },
      { uid: 7687, envelope_subject: "Re: Test thread 2019-02" }
    ]
  })
})

afterEach(() => {
  db.prepare("delete from accounts").run()
})