import { default as Connection, default as imap } from "imap"
import * as kefir from "kefir"
import { simpleParser } from "mailparser"
import { Readable } from "stream"
import { decode } from "../encoding"
import * as C from "../imap/connection"
import {
  getPartByPartId,
  Headers as MessageHeaders,
  HeaderValue
} from "../models/Message"
import * as kefirUtil from "../util/kefir"
import * as promises from "../util/promises"
import alignState from "./alignState"
import { combineHandlers } from "./combineHandlers"
import * as state from "./state"
import { BoxSpecifier } from "./types"

export { Action } from "./combineHandlers"
export * from "./types"

const MESSAGE = "Message"
const BODY = "Body"
const HEADERS = "Headers"

export type FetchResponse = Message | Body | Headers

interface Message {
  type: typeof MESSAGE
  attributes: imap.ImapMessageAttributes
}

interface Body {
  type: typeof BODY
  messageAttributes: imap.ImapMessageAttributes
  which: string
  size: number
  data: Buffer
}

interface Headers {
  type: typeof HEADERS
  messageAttributes: imap.ImapMessageAttributes
  headers: SerializedHeaders
}

type R<T> = kefir.Observable<T, Error>
type SerializedHeaders = Array<[string, HeaderValue]>

const headersSelection = "HEADER"

export const { actions, perform } = combineHandlers({
  addFlags(
    connection: Connection,
    box: BoxSpecifier,
    source: imap.MessageSource,
    flags: string[]
  ): R<void> {
    return withBox(connection, box, () => {
      const result = promises.lift0(cb =>
        connection.addFlags(source, flags, cb)
      )
      return kefir.fromPromise(result)
    })
  },

  delFlags(
    connection: Connection,
    box: BoxSpecifier,
    source: imap.MessageSource,
    flags: string[]
  ): R<void> {
    return withBox(connection, box, () => {
      const result = promises.lift0(cb =>
        connection.delFlags(source, flags, cb)
      )
      return kefir.fromPromise(result)
    })
  },

  delLabels(
    connection: Connection,
    box: BoxSpecifier,
    source: imap.MessageSource,
    labels: string[]
  ): R<void> {
    return withBox(connection, box, () => {
      const result = promises.lift0(cb =>
        connection.delLabels(source, labels, cb)
      )
      return kefir.fromPromise(result)
    })
  },

  end(connection: Connection): R<undefined> {
    connection.end()
    return kefir.constant(undefined)
  },

  fetch(
    connection: Connection,
    box: BoxSpecifier,
    source: imap.MessageSource,
    options: imap.FetchOptions = {}
  ): R<FetchResponse> {
    return withBox(connection, box, () =>
      kefirUtil
        .fromEventsWithEnd<imap.ImapMessage>(
          connection.fetch(source, options),
          "message",
          (msg, _seqno) => msg
        )
        .mapErrors(
          error => new Error(`IMAP error fetching ${source}: ${error.message}`)
        )
        .flatMap(emitter => {
          const attrStream = getAttributes(emitter)
          const bodiesStream = getBodies(emitter, attrStream)
          const headersStream = getHeaders(bodiesStream)
          return attrStream
            .map(attributes => ({ type: MESSAGE, attributes } as const))
            .merge(headersStream)
            .merge(bodiesStream)
        })
    )
  },

  getBox(connection: Connection, box: BoxSpecifier): R<imap.Box> {
    return withBox(connection, box, () =>
      kefir.constant((connection as any)._box)
    )
  },

  getBoxes(connection: Connection, nsPrefix?: string): R<imap.MailBoxes> {
    return kefir.fromNodeCallback(cb =>
      nsPrefix ? connection.getBoxes(nsPrefix, cb) : connection.getBoxes(cb)
    )
  },

  getCapabilities(connection: Connection): R<string[]> {
    return kefir.constant(C.capabilities(connection) || [])
  },

  search(
    connection: Connection,
    box: BoxSpecifier,
    criteria: any[]
  ): R<imap.UID[]> {
    return withBox(connection, box, () =>
      kefir.fromNodeCallback(cb => connection.search(criteria, cb))
    )
  }
})

function withBox<T>(
  connection: Connection,
  box: BoxSpecifier,
  fn: () => R<T>
): R<T> {
  return kefir
    .fromPromise(alignState(state.openBox(box), connection))
    .flatMap(() => fn())
}

function getAttributes(
  message: imap.ImapMessage
): kefir.Observable<imap.ImapMessageAttributes, Error> {
  return kefirUtil.fromEventsWithEnd(message, "attributes")
}

function getBodies(
  emitter: imap.ImapMessage,
  attrStream: R<imap.ImapMessageAttributes>
): R<Body> {
  return getBodiesWithAttributes(emitter, attrStream).flatMap(
    ({ messageAttributes, info, stream }) => {
      if (info.size === 0) {
        return kefir.constant({
          ...info,
          type: BODY,
          messageAttributes,
          data: Buffer.alloc(0)
        })
      }
      const part = getPartByPartId(info.which, messageAttributes)
      const encoding = part && part.encoding
      return kefirUtil
        .fromReadable(encoding ? decode(encoding, stream) : stream)
        .map(buffer => ({
          ...info,
          type: BODY,
          messageAttributes,
          data: buffer
        }))
    }
  )
}

function getBodiesWithAttributes(
  emitter: imap.ImapMessage,
  attrStream: R<imap.ImapMessageAttributes>
): R<{
  messageAttributes: imap.ImapMessageAttributes
  stream: Readable
  info: imap.ImapMessageBodyInfo
}> {
  const attrPromise = attrStream.toPromise()
  return kefirUtil
    .fromEventsWithEnd(
      emitter,
      "body",
      (stream: Readable, info: imap.ImapMessageBodyInfo) => ({
        info,
        stream
      })
    )
    .flatMap(({ info, stream }) =>
      kefir
        .fromPromise<imap.ImapMessageAttributes, Error>(attrPromise)
        .map(messageAttributes => ({
          messageAttributes,
          info,
          stream
        }))
    )
}

function getHeaders(stream: R<Body>): R<Headers> {
  return stream
    .filter(({ which }) => which === headersSelection)
    .flatMap(({ messageAttributes, data }) => {
      const headers = simpleParser(data).then(mail => mail.headers)
      return kefir.fromPromise<MessageHeaders, Error>(headers).map(
        headers =>
          ({
            type: HEADERS,
            messageAttributes,
            headers: Array.from(headers.entries())
          } as const)
      )
    })
}

export function isBody(x: FetchResponse): x is Body {
  return x.type === BODY
}

export function isHeaders(x: FetchResponse): x is Headers {
  return x.type === HEADERS
}

export function isMessage(x: FetchResponse): x is Message {
  return x.type === MESSAGE
}

export function messageAttributes(
  x: FetchResponse
): imap.ImapMessageAttributes {
  return isMessage(x) ? x.attributes : x.messageAttributes
}
