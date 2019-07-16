import eol from "eol"
import imap from "imap"
import * as cache from "../cache"
import { inbox, testThread } from "../cache/testFixtures"
import db from "../db"
import * as C from "../models/conversation"
import { MessageAttributes } from "../types"
import * as promises from "../util/promises"
import { composeEdit } from "./edit"
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
  const { attributes, headers, partHeaders, bodies } = composeReply({
    account,
    content: { type: "text", subtype: "plain", content: "hi" },
    conversation: conversationFrom(testThread)
  })
  attributes.date = new Date("2019-05-21T18:51Z")
  const message = serialize({
    attributes,
    headers,
    partHeaders,
    bodies(partId) {
      return bodies[partId]
    }
  })
  const serialized = await promises.lift1<Buffer>(cb => message.build(cb))
  expect(serialized.toString("utf8")).toEqual(
    eol.crlf(
      `
Content-Type: text/plain; charset=UTF-8
Content-ID: ${(attributes.struct![0] as imap.ImapMessagePart).id}
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

it("serializes a multipart message", async () => {
  const testMessage = testThread[1].attributes
  const testPart = testMessage.struct![0] as imap.ImapMessagePart
  const editedMessage = { envelope_messageId: testMessage.envelope.messageId }
  const editedPart = {
    content_id: testPart.id
  }
  const { attributes, headers, partHeaders, bodies } = composeEdit({
    account,
    content: { type: "text", subtype: "plain", content: "er, Hello" },
    conversation: conversationFrom(testThread),
    editedMessage,
    editedPart
  })
  attributes.date = new Date("2019-05-21T18:51Z")
  const message = serialize({
    attributes,
    headers,
    partHeaders,
    bodies(partId) {
      return bodies[partId]
    }
  })
  const boundary = (message as any)._generateBoundary()
  const serialized = await promises.lift1<Buffer>(cb => message.build(cb))
  expect(serialized.toString("utf8")).toEqual(
    eol.crlf(
      `
Content-Type: multipart/mixed;
 boundary="${boundary}"
Message-ID: ${attributes.envelope.messageId}
From: jesse@sitr.us
To: Jesse Hallett <hallettj@gmail.com>
Subject: Re: Test thread 2019-02
In-Reply-To:
 <CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA@mail.gmail.com>
References:
 <CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>
 <CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA@mail.gmail.com>
Date: Tue, 21 May 2019 18:51:00 +0000
MIME-Version: 1.0

--${boundary}
Content-Type: text/plain; charset=UTF-8
Content-Disposition: fallback
Content-ID: ${(attributes.struct as any)[1][0].id}
Content-Transfer-Encoding: quoted-printable

Edited message:
--${boundary}
Content-Type: text/plain; charset=UTF-8
Content-Disposition: replacement
Content-ID: ${(attributes.struct as any)[2][0].id}
Replaces:
 <mid:CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA%40mail.gmail.com/0337ae7e-c468-437d-b7e1-95dc7d9debb8%40gmail.com>
Content-Transfer-Encoding: quoted-printable

er, Hello
--${boundary}--
      `.trim() + "\r\n"
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
  messages: Array<{ attributes: MessageAttributes }>
): C.Conversation {
  for (const msg of messages) {
    cache.persistAttributes({ accountId, boxId }, msg.attributes)
  }
  return cache.getThreads(accountId)[0]
}
