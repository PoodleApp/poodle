import imap from "imap"
import db from "../db"
import * as cache from "./persist"
import { inbox, testContent, testThread } from "./testFixtures"
import { ID } from "./types"

const testMessage = testThread[0]
let accountId: ID

beforeEach(() => {
  const { lastInsertRowid } = db
    .prepare("insert into accounts (email) values(?)")
    .run("jesse@sitr.us")
  accountId = lastInsertRowid
})

describe("boxes", () => {
  let boxId: ID

  beforeEach(() => {
    boxId = cache.persistBoxState(accountId, inbox)
    for (const { attributes } of testThread) {
      cache.persistAttributes({ accountId, boxId }, attributes)
    }
  })

  it("saves box metadata", () => {
    expect(db.prepare("select * from boxes").all()).toMatchObject([
      {
        id: boxId,
        account_id: accountId,
        name: inbox.name,
        uidvalidity: inbox.uidvalidity,
        uidnext: inbox.uidnext
      }
    ])
  })

  it("deletes message records when a box is deleted", () => {
    db.prepare("delete from boxes where id = ?").run(boxId)
    expect(db.prepare("select * from messages").all()).toEqual([])
  })

  it("deletes message records when uidvalidity changes", () => {
    cache.persistBoxState(accountId, { ...inbox, uidvalidity: 7777 })
    expect(db.prepare("select * from boxes").all()).toMatchObject([
      { name: inbox.name, uidvalidity: 7777 }
    ])
    expect(db.prepare("select * from messages").all()).toEqual([])
  })

  it("does not delete message records when uidvalidity does not change", () => {
    cache.persistBoxState(accountId, inbox)
    expect(
      db.prepare("select * from messages order by uid").all()
    ).toMatchObject([
      { box_id: boxId, uid: testThread[0].attributes.uid },
      { box_id: boxId, uid: testThread[1].attributes.uid }
    ])
  })

  it("updates `uidnext` when storing messages for a box on-record", () => {
    const sameBoxId = cache.persistBoxState(accountId, {
      ...inbox,
      uidnext: 100001
    })
    expect(sameBoxId).toBe(boxId)
    expect(db.prepare("select * from boxes").all()).toMatchObject([
      { name: inbox.name, uidvalidity: inbox.uidvalidity, uidnext: 100001 }
    ])
  })
})

describe("saving a single message", () => {
  let id: ID
  let boxId: ID

  beforeEach(() => {
    boxId = cache.persistBoxState(accountId, inbox)
    id = cache.persistAttributes({ accountId, boxId }, testMessage.attributes)
  })

  describe("messages", () => {
    it("stores a message record in the database", () => {
      const message = db.prepare("select * from messages where id = ?").get(id)
      expect(message).toMatchObject({
        account_id: accountId,
        box_id: boxId,
        date: "2019-01-31T23:40:04.000Z",
        envelope_date: "2019-01-31T23:40:04.000Z",
        envelope_inReplyTo: null,
        envelope_messageId:
          "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>",
        envelope_subject: "Test thread 2019-02",
        modseq: "3212743",
        uid: testMessage.attributes.uid,
        x_gm_msgid: "1624221160905154372",
        x_gm_thrid: "1624221157079778491"
      })
    })

    it("updates a message if there is an existing record", () => {
      const newId = cache.persistAttributes(
        { accountId, boxId },
        {
          ...testMessage.attributes,
          flags: ["\\Seen", "\\Important"],
          "x-gm-labels": ["\\Important", "\\Sent", "\\Poodle"]
        }
      )
      expect(db.prepare("select * from messages").all()).toMatchObject([
        {
          account_id: accountId,
          box_id: boxId,
          date: "2019-01-31T23:40:04.000Z",
          envelope_date: "2019-01-31T23:40:04.000Z",
          envelope_inReplyTo: null,
          envelope_messageId:
            "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>",
          envelope_subject: "Test thread 2019-02",
          modseq: "3212743",
          uid: testMessage.attributes.uid,
          x_gm_msgid: "1624221160905154372",
          x_gm_thrid: "1624221157079778491"
        }
      ])
      expect(
        db.prepare("select * from message_flags order by flag").all()
      ).toMatchObject([
        { message_id: newId, flag: "\\Important" },
        { message_id: newId, flag: "\\Seen" }
      ])
      expect(
        db.prepare("select * from message_gmail_labels order by label").all()
      ).toMatchObject([
        { message_id: newId, label: "\\Important" },
        { message_id: newId, label: "\\Poodle" },
        { message_id: newId, label: "\\Sent" }
      ])
    })

    it("stores `null` for undefined attributes", () => {
      const sparse = Object.assign({}, testMessage.attributes)
      sparse.uid = testMessage.attributes.uid + 1
      delete sparse.modseq
      delete sparse["x-gm-msgid"]
      delete sparse["x-gm-thrid"]
      const messageId = cache.persistAttributes({ accountId, boxId }, sparse)
      const message = db
        .prepare("select * from messages where id = ?")
        .get(messageId)
      expect(message).toMatchObject({
        modseq: null,
        x_gm_msgid: null,
        x_gm_thrid: null
      })
    })

    it("deletes message record when owning account record is deleted", () => {
      db.prepare("delete from accounts where id = ?").run(accountId)
      const messages = db.prepare("select * from messages where id = ?").all(id)
      expect(messages).toEqual([])
    })

    it("wraps metadata recording in a transaction", () => {
      db.prepare("delete from messages").run()
      try {
        cache.persistAttributes(
          { accountId, boxId },
          {
            ...testMessage.attributes,
            envelope: undefined as any
          }
        )
      } catch (_) {}
      const messages = db.prepare("select * from messages where id = ?").all(id)
      expect(messages).toEqual([])
    })
  })

  describe("message participants", () => {
    it("records 'from' participants", () => {
      const to = db
        .prepare(
          "select * from message_participants where message_id = ? and type = 'from'"
        )
        .all(id)
      expect(to).toMatchObject([
        { host: "gmail.com", mailbox: "hallettj", name: "Jesse Hallett" }
      ])
    })

    it("records 'to' participants", () => {
      const to = db
        .prepare(
          "select * from message_participants where message_id = ? and type = 'to'"
        )
        .all(id)
      expect(to).toMatchObject([
        { host: "sitr.us", mailbox: "jesse", name: "Jesse Hallett" }
      ])
    })
  })

  describe("message flags", () => {
    it("records flags", () => {
      const flags = db
        .prepare(
          "select * from message_flags where message_id = ? order by flag"
        )
        .all(id)
      expect(flags).toMatchObject([{ flag: "\\Answered" }, { flag: "\\Seen" }])
    })
  })

  describe("message gmail labels", () => {
    it("records gmail labels", () => {
      const labels = db
        .prepare("select * from message_gmail_labels where message_id = ?")
        .all(id)
      expect(labels.map(r => r.label)).toEqual(
        expect.arrayContaining(["\\Important", "\\Inbox", "\\Sent"])
      )
    })
  })

  describe("message structs", () => {
    it("records hierarchical structure of MIME parts", () => {
      const structs = db
        .prepare(
          "select * from message_structs where message_id = ? order by lft"
        )
        .all(id)
      expect(structs).toMatchObject([
        {
          subtype: "mixed",
          type: "multipart",
          content_id: null,
          params_charset: null,
          part_id: "1",
          lft: 1,
          rgt: 10
        },
        {
          subtype: "alternative",
          type: "multipart",
          content_id: null,
          params_charset: null,
          part_id: "2",
          lft: 2,
          rgt: 7
        },
        {
          subtype: "plain",
          type: "text",
          content_id: "textFallback",
          params_charset: "UTF-8",
          part_id: "3",
          size: 5,
          encoding: "7BIT",
          lft: 3,
          rgt: 4
        },
        {
          subtype: "html",
          type: "text",
          description: null,
          disposition_type: null,
          content_id: "htmlContent",
          params_charset: "UTF-8",
          part_id: "4",
          md5: null,
          size: 8,
          encoding: "7BIT",
          lft: 5,
          rgt: 6
        },
        {
          subtype: "jpeg",
          type: "image",
          disposition_filename: "cat.jpg",
          disposition_type: "attachment",
          content_id: "attachment",
          params_charset: null,
          part_id: "5",
          size: 100,
          encoding: "7BIT",
          lft: 8,
          rgt: 9
        }
      ])
    })
  })

  describe("message references", () => {
    it("stores message IDs of earlier messages in the conversation", () => {
      const newId = cache.persistAttributes(
        { accountId, boxId },
        testThread[1].attributes
      )
      cache.persistHeadersAndReferences(newId, testThread[1].headers)
      expect(
        db
          .prepare(
            "select * from message_references where message_id = ? order by referenced_id"
          )
          .all(newId)
      ).toMatchObject([
        {
          referenced_id:
            "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>"
        }
      ])
    })

    it("stores references for a message with multiple references", () => {
      const newId = cache.persistAttributes(
        { accountId, boxId },
        {
          ...testMessage.attributes,
          uid: testMessage.attributes.uid + 1
        }
      )
      cache.persistHeadersAndReferences(newId, [
        [
          "references",
          [
            "<CAFN-=ivdbdu0PQjwZuC4SRAxhsAm3C7xiVox17HN5h-t278x=Q@mail.gmail.com>",
            "<CAGM-pNvDQ-e-016-x+LeU_AY=AwkRgEvpDBmJNOi3r3KcqwF=A@mail.gmail.com>"
          ]
        ]
      ])
      expect(
        db
          .prepare("select * from message_references where message_id = ?")
          .all(newId)
      ).toMatchObject([
        {
          referenced_id:
            "<CAFN-=ivdbdu0PQjwZuC4SRAxhsAm3C7xiVox17HN5h-t278x=Q@mail.gmail.com>"
        },
        {
          referenced_id:
            "<CAGM-pNvDQ-e-016-x+LeU_AY=AwkRgEvpDBmJNOi3r3KcqwF=A@mail.gmail.com>"
        }
      ])
    })
  })

  describe("message headers", () => {
    it("stores message headers in the database", () => {
      cache.persistHeadersAndReferences(id, testMessage.headers)
      const headers = db
        .prepare("select * from message_headers where message_id = ?")
        .all(id)
      expect(headers).toEqual(
        expect.arrayContaining(
          [
            ["mime-version", "1.0"],
            ["date", "2019-01-31T23:40:04.000Z"],
            [
              "message-id",
              "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>"
            ],
            ["subject", "Test thread 2019-02"],
            [
              "from",
              {
                value: [
                  { address: "hallettj@gmail.com", name: "Jesse Hallett" }
                ],
                html:
                  '<span class="mp_address_group"><span class="mp_address_name">Jesse Hallett</span> &lt;<a href="mailto:hallettj@gmail.com" class="mp_address_email">hallettj@gmail.com</a>&gt;</span>',
                text: "Jesse Hallett <hallettj@gmail.com>"
              }
            ],
            [
              "to",
              {
                value: [{ address: "jesse@sitr.us", name: "Jesse Hallett" }],
                html:
                  '<span class="mp_address_group"><span class="mp_address_name">Jesse Hallett</span> &lt;<a href="mailto:jesse@sitr.us" class="mp_address_email">jesse@sitr.us</a>&gt;</span>',
                text: "Jesse Hallett <jesse@sitr.us>"
              }
            ],
            [
              "content-type",
              { value: "text/plain", params: { charset: "UTF-8" } }
            ]
          ].map(([key, value]) => ({
            id: expect.any(Number),
            message_id: id,
            key,
            value: JSON.stringify(value)
          }))
        )
      )
    })
  })

  describe("message bodies", () => {
    it("stores bodies for message parts", () => {
      const alternative = testMessage.attributes.struct![1]
      const plainPart: imap.ImapMessagePart = (alternative as any)[1][0]
      const htmlPart: imap.ImapMessagePart = (alternative as any)[2][0]
      for (const part of [plainPart, htmlPart]) {
        const content = testContent
          .get(String(testMessage.attributes.envelope.messageId))!
          .get(part.partID!)!
        cache.persistBody(id, part, Buffer.from(content, "utf8"))
      }
      expect(
        db
          .prepare(
            `
              select s.part_id, b.content from message_bodies as b
              join message_structs as s on message_struct_id = s.id
            `
          )
          .all()
      ).toEqual(
        expect.arrayContaining([
          {
            part_id: "3",
            content: Buffer.from("This is a test.", "utf8")
          },
          {
            part_id: "4",
            content: Buffer.from("<p>This is a test.</p>", "utf8")
          }
        ])
      )
    })
  })
})

afterEach(() => {
  db.prepare("delete from accounts").run()
})
