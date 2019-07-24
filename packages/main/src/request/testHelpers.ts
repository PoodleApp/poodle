import toStream from "buffer-to-stream"
import { EventEmitter } from "events"
import equal from "fast-deep-equal"
import { default as Connection, default as imap } from "imap"
import { Range, Seq, Set } from "immutable"
import moment from "moment"
import { Transporter } from "nodemailer"
import Mailer from "nodemailer/lib/mailer"
import { Readable } from "stream"
import { SerializedHeaders } from "../cache"
import { testThread } from "../cache/testFixtures"
import { ComposedMessage } from "../compose"
import { processHeaderValue } from "../compose/serialize"
import ConnectionManager from "../managers/ConnectionManager"
import { mock } from "../testHelpers"
import { nonNull } from "../util/array"

export function mockConnection({
  thread = testThread,
  searchResults = []
}: {
  thread?: ComposedMessage[]
  searchResults?: Array<[unknown, number[]]>
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
    mockFetchImplementation({ thread })
  )

  mock(Connection.prototype.search).mockImplementation((criteria, cb) => {
    const match = searchResults.find(([c]) => equal(c, criteria))
    if (match) {
      const [, uids] = match
      cb(null, uids.map(String))
      return
    }

    const allUids = Set<number>(
      thread.map(({ attributes }) => attributes.uid).filter(nonNull)
    )

    const uids = criteria.reduce((accum: Set<number>, c) => {
      if (c instanceof Array && c[0] === "HEADER" && c[1] === "Message-ID") {
        const messageId = c[2]
        return accum.filter(uid =>
          thread
            .filter(({ headers }) =>
              headers.some(
                ([key, value]) => key === "message-id" && value === messageId
              )
            )
            .some(({ attributes }) => uid === attributes.uid)
        )
      }

      if (c instanceof Array && c[0] === "SINCE") {
        const since = moment(c[1], "LL")
        return accum.filter(uid =>
          thread.some(
            ({ attributes }) =>
              uid === attributes.uid && since.isBefore(attributes.date)
          )
        )
      }

      if (c instanceof Array && c[0] === "UID") {
        const uidRange = parseRange(c[1])
        return accum.filter(uid => uidRange.includes(uid))
      }

      if (c instanceof Array && c[0] === "X-GM-THRID") {
        const thrid = c[1]
        return accum.filter(uid =>
          thread.some(
            ({ attributes }) =>
              uid === attributes.uid && thrid === attributes["x-gm-thrid"]
          )
        )
      }
    }, allUids)

    cb(
      null,
      uids
        .valueSeq()
        .map(String)
        .toArray()
    )
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
      uidnext: testThread[1].attributes.uid! + 1,
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
  thread = testThread
}: {
  thread?: ComposedMessage[]
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

        for (const [key, content] of Object.entries(message.bodies)) {
          if (getBodies(options).includes(key)) {
            const readable =
              content.toString("utf8").length > 0
                ? toStream(content)
                : neverEndingReadable()
            emitter.emit("body", readable, {
              which: key,
              size: content.toString("utf8").length
            })
          }
        }

        for (const [key, headers] of Object.entries(message.partHeaders)) {
          const which = `${key}.MIME`
          if (getBodies(options).includes(which)) {
            emitter.emit("body", headersStream(headers), { which })
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
  thread: ComposedMessage[],
  source: imap.MessageSource
): ComposedMessage[] {
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
  return thread.filter(message => uids.includes(message.attributes.uid!))
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
  return toStream(
    headers
      .map(([key, value]) => {
        const processed = processHeaderValue(value)
        return processed ? `${key}: ${processed}` : null
      })
      .filter(nonNull)
      .join("\n")
  )
}

function neverEndingReadable(): Readable {
  const r = new Readable()
  r._read = () => Buffer.alloc(0)
  return r
}
