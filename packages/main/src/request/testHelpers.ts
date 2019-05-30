import { EventEmitter } from "events"
import { default as Connection, default as imap } from "imap"
import { Range, Seq, Set } from "immutable"
import { Transporter } from "nodemailer"
import Mailer from "nodemailer/lib/mailer"
import { Readable } from "stream"
import stringToStream from "string-to-stream"
import { testContent, testThread } from "../cache/testFixtures"
import ConnectionManager from "../managers/ConnectionManager"
import { HeaderValue } from "../models/Message"
import { mock } from "../testHelpers"

type Message = {
  attributes: imap.ImapMessageAttributes
  headers: SerializedHeaders
}
type SerializedHeaders = Array<[string, HeaderValue]>

export function mockConnection({
  content = testContent,
  thread = testThread
}: {
  content?: typeof testContent
  thread?: Message[]
} = {}): ConnectionManager {
  const boxes = {
    INBOX: { attribs: ["\\Inbox"] },
    "[Gmail]/All Mail": { attribs: ["\\All"] }
  }

  mock(Connection.prototype.addFlags).mockImplementation(
    (_source, _flags, cb) => {
      cb(null)
    }
  )
  mock(Connection.prototype.delFlags).mockImplementation(
    (_source, _flags, cb) => {
      cb(null)
    }
  )
  mock(Connection.prototype.delLabels).mockImplementation(
    (_source, _labels, cb) => {
      cb(null)
    }
  )
  mock(Connection.prototype.getBoxes).mockImplementation((cb: any) => {
    cb(null, boxes)
  })
  mock(Connection.prototype.fetch).mockImplementation(
    mockFetchImplementation({
      content,
      thread
    })
  )

  mock(Connection.prototype.search).mockImplementation((criteria, cb) => {
    let uids = Set()
    for (const c of criteria) {
      if (c instanceof Array && c[0] === "HEADER" && c[1] === "Message-ID") {
        const messageId = c[2]
        uids = uids.concat(
          testThread
            .filter(({ headers }) =>
              headers.some(
                ([key, value]) => key === "message-id" && value === messageId
              )
            )
            .map(({ attributes }) => attributes.uid)
        )
      }
    }
    cb(null, uids.valueSeq().toArray())
  })

  mock(Connection.prototype.connect).mockReturnValue(undefined)

  mock(Connection.prototype.openBox).mockImplementation(function openBox(
    this: Connection,
    name,
    readOnly,
    cb
  ) {
    const box = {
      name,
      readOnly,
      uidvalidity: 123,
      uidnext: testThread[1].attributes.uid + 1,
      flags: [],
      permFlags: [],
      newKeywords: false,
      persistentUIDs: true,
      messages: {
        total: 2,
        new: 2,
        unseen: 2
      }
    }
    ;(this as any)._box = box
    cb(null, box)
  })

  mock(Connection.prototype.closeBox).mockImplementation(function closeBox(
    this: Connection,
    _autoExpunge,
    cb
  ) {
    ;(this as any)._box = null
    cb(null)
  })

  return new ConnectionManager(async () => {
    const conn = new Connection({})
    conn.state = "connected"
    return conn
  })
}

export function mockFetchImplementation({
  content = testContent,
  thread = testThread
}: {
  content?: typeof testContent
  thread?: Message[]
} = {}): (
  source: imap.MessageSource,
  options: imap.FetchOptions
) => EventEmitter {
  return (source, options) => {
    const messages = messagesMatchingSource(thread, source)
    const withEmitters = messages.map(
      message => [message, new EventEmitter()] as const
    )

    setTimeout(() => {
      for (const [message, emitter] of withEmitters) {
        const attributes = { ...message.attributes } as any
        if (!options.envelope) {
          attributes.envelope = null
        }
        if (!options.struct) {
          attributes.struct = null
        }
        emitter.emit("attributes", attributes)

        if (getBodies(options).includes("HEADER")) {
          emitter.emit("body", headersStream(message.headers), {
            which: "HEADER"
          })
        }

        const contentMap = content.get(
          String(message.attributes.envelope.messageId)
        )!
        for (const [key, content] of contentMap) {
          if (getBodies(options).includes(key)) {
            const readable =
              content.length > 0
                ? stringToStream(content)
                : neverEndingReadable()
            emitter.emit("body", readable, {
              which: key,
              size: content.length
            })
          }
        }

        emitter.emit("end")
      }
    }, 10)

    const messagesEmitter = new EventEmitter()
    setTimeout(() => {
      for (const [, emitter] of withEmitters) {
        messagesEmitter.emit("message", emitter)
      }
      messagesEmitter.emit("end")
    }, 5)
    return messagesEmitter
  }
}

export function mockSmtpTransporters(): Transporter {
  mock(Mailer.prototype.sendMail).mockImplementation(async _mailOptions => {
    return { success: true }
  })
  return new Mailer(null as any, null as any, null as any)
}

function messagesMatchingSource(
  thread: Message[],
  source: imap.MessageSource
): Message[] {
  let uids: Seq.Indexed<number>
  if (source instanceof Array) {
    uids = Seq(
      (source as any[]).map((uid: string | number) =>
        typeof uid === "string" ? parseInt(uid, 10) : uid
      )
    )
  } else if (typeof source === "string") {
    uids = parseRange(source)
  } else {
    throw new Error(`Cannot parse fetch source: ${source}`)
  }
  return thread.filter(message => {
    const uid = message.attributes.uid
    return uids.includes(uid)
  })
}

function parseRange(source: string): Seq.Indexed<number> {
  const [start, end] = source.split(":").map(b => parseInt(b, 10))
  const firstUid = isNaN(start) ? 1 : start
  const lastUid = end != null ? (isNaN(end) ? Infinity : end) : firstUid
  return Range(firstUid, lastUid + 1)
}

function getBodies(options: imap.FetchOptions): string[] {
  if (!options.bodies) {
    return []
  }
  if (options.bodies instanceof Array) {
    return options.bodies
  }
  return [options.bodies]
}

function headersStream(headers: SerializedHeaders): Readable {
  return stringToStream(
    headers.map(([key, value]) => `${key}: ${value}`).join("\n")
  )
}

function neverEndingReadable(): Readable {
  const r = new Readable()
  r._read = () => Buffer.alloc(0)
  return r
}
