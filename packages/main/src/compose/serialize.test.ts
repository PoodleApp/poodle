import eol from "eol"
import imap from "imap"
import * as cache from "../cache"
import { inbox, testThread } from "../cache/testFixtures"
import db from "../db"
import * as C from "../models/conversation"
import * as promises from "../util/promises"
import { composeReply } from "./reply"
import { serialize } from "./serialize"

let account: cache.Account
let accountId: cache.ID
let boxId: cache.ID

beforeEach(async () => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values (?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid
  account = cache.getAccount(accountId)!
  boxId = cache.persistBoxState(accountId, inbox)
})

it("serializes a message", async () => {
  const { attributes, headers, bodies } = composeReply({
    account,
    content: { type: "text", subtype: "plain", content: "hi" },
    conversation: conversationFrom(testThread)
  })
  attributes.date = new Date("2019-05-21T18:51Z")
  const message = serialize({
    attributes,
    headers,
    bodies(partId) {
      return bodies[partId]
    }
  })
  const serialized = await promises.lift1<Buffer>(cb => message.build(cb))
  expect(serialized.toString("utf8")).toEqual(
    eol.crlf(
      `
Content-Type: text/plain; charset=UTF-8
Content-Length: 2
Message-ID: ${attributes.envelope.messageId}
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

hi
      `.trim()
    )
  )
  expect(message.getEnvelope()).toEqual({
    from: "jesse@sitr.us",
    to: ["hallettj@gmail.com"]
  })
})

afterEach(() => {
  db.prepare("delete from accounts").run()
})

function conversationFrom(
  messages: Array<{ attributes: imap.ImapMessageAttributes }>
): C.Conversation {
  for (const msg of messages) {
    cache.persistAttributes({ accountId, boxId }, msg.attributes)
  }
  return cache.getThreads(accountId)[0]
}
