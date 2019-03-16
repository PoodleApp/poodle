import { EventEmitter } from "events"
import imap from "imap"
import { Readable } from "stream"
import stringToStream from "string-to-stream"
import { testContent, testThread } from "../cache/testFixtures"
import { HeaderValue } from "../models/Message"

type Message = {
  attributes: imap.ImapMessageAttributes
  headers: SerializedHeaders
}
type SerializedHeaders = Array<[string, HeaderValue]>

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

        const contentMap = content.get(String(message.attributes.uid))!
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

function messagesMatchingSource(
  thread: Message[],
  source: imap.MessageSource
): Message[] {
  if (typeof source !== "string") {
    throw new Error(`Unable to parse source, ${source}`)
  }
  const [start, end] = source.split(":").map(b => parseInt(b, 10))
  const firstUid = isNaN(start) ? 1 : start
  const lastUid = end != null ? (isNaN(end) ? Infinity : end) : firstUid
  return thread.filter(message => {
    const uid = message.attributes.uid
    return firstUid <= uid && uid <= lastUid
  })
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
