/*
 * Interactions with IMAP and SMTP servers should be scheduled using the queue
 * defined in this module. Schedule an action using the `actions` action creator
 * map, and the `schedule` function. For example:
 *
 *     schedule(actions.archive({ accountId, box, uids }))
 *
 * `schedule` returns a promise that resolves with the value of the promise
 * returned in the `process` stage (see below). But note that you must not rely
 * on that promise to keep application state up-to-date because the scheduled
 * task might not run until after an application restart at which time any
 * promise callbacks will no longer exist.
 *
 * Once in the queue tasks are seralized in a sqlite store so that tasks persist
 * across application restarts.
 *
 * Each action is defined by a handler, which is made up of at least two stages:
 *
 * - enqueue : Called immediately. Update the local cache to reflect pending
 *             changes, and compute parameters for the next stage. The return
 *             value of the `enqueue` stage is given as an argument to the
 *             `process` and `failure` stages. The return value *must* be
 *             serializable.
 * - process : Called when the task gets to the front of the queue. Make calls
 *             to IMAP and SMTP services. Returns a promise. The resolved value
 *             of the promise becomes the resolved value of the promise returned
 *             by the top-level `schedule` function. An rejected value from the
 *             `process` promise will be wrapped, and the wrapped value will
 *             become the rejected value of the promise returned by `schedule`.
 * - failure : (Optional) Called in case a task fails. Gets two arguments: an
 *             error value, and the same argument that was given to the
 *             `process` stage. This is the place to undo changes to the local
 *             cache to reflect the fact that expected changes did not take
 *             place server-side.
 */

import * as fs from "fs"
import { Transporter } from "nodemailer"
import * as path from "path"
import xdgBasedir from "xdg-basedir"
import * as cache from "../cache"
import { ComposedMessage, serialize } from "../compose"
import db from "../db"
import AccountManager from "../managers/AccountManager"
import ConnectionManager from "../managers/ConnectionManager"
import * as M from "../models/Message"
import * as request from "../request"
import { sync } from "../sync"
import { MessageAttributes } from "../types"
import * as promises from "../util/promises"
import SqliteStore from "./better-queue-better-sqlite3"
import { combineHandlers, handler, LOW_PRIORITY, Task } from "./combineHandlers"

type ID = string

const handlers = {
  archive: handler({
    enqueue(params: { accountId: ID; box: { name: string }; uids: number[] }) {
      cache.delLabels({ ...params, labels: ["\\Inbox"] })
      return params
    },

    process({
      accountId,
      box,
      uids
    }: {
      accountId: ID
      box: { name: string }
      uids: number[]
    }): Promise<void> {
      return withConnectionManager(accountId, connectionManager =>
        connectionManager
          .request(
            request.actions.delLabels(
              { name: box.name, readonly: false },
              uids,
              ["\\Inbox"]
            )
          )
          .toPromise()
      )
    },
    failure(
      _error,
      {
        accountId,
        box,
        uids
      }: {
        accountId: ID
        box: { name: string }
        uids: number[]
      }
    ) {
      cache.addLabels({ accountId, box, uids, labels: ["\\Inbox"] })
    }
  }),

  markAsRead: handler({
    enqueue(params: { accountId: ID; box: { name: string }; uids: number[] }) {
      cache.addFlag({ ...params, flag: "\\Seen" })
      return params
    },

    process({
      accountId,
      box,
      uids
    }: {
      accountId: ID
      box: { name: string }
      uids: number[]
    }): Promise<void> {
      return withConnectionManager(accountId, connectionManager =>
        connectionManager
          .request(
            request.actions.addFlags(
              { name: box.name, readonly: false },
              uids,
              ["\\Seen"]
            )
          )
          .toPromise()
      )
    },
    failure(_error, { accountId, box, uids }) {
      cache.delFlags({ accountId, box, uids, flags: ["\\Seen"] })
    }
  }),

  unmarkAsRead: handler({
    enqueue(params: { accountId: ID; box: { name: string }; uids: number[] }) {
      cache.delFlags({ ...params, flags: ["\\Seen"] })
      return params
    },

    process({
      accountId,
      box,
      uids
    }: {
      accountId: ID
      box: { name: string }
      uids: number[]
    }): Promise<void> {
      return withConnectionManager(accountId, connectionManager =>
        connectionManager
          .request(
            request.actions.delFlags(
              { name: box.name, readonly: false },
              uids,
              ["\\Seen"]
            )
          )
          .toPromise()
      )
    },

    failure(_error, { accountId, box, uids }) {
      cache.addFlag({ accountId, box, uids, flag: "\\Seen" })
    }
  }),

  sendMessage: handler({
    enqueue({
      accountId,
      message
    }: {
      accountId: ID
      message: ComposedMessage
    }) {
      const { attributes, headers, partHeaders, bodies } = message
      let messageId: cache.ID | null = null
      db.transaction(() => {
        const updatedAt = new Date().toISOString()
        messageId = cache.persistAttributes(
          { accountId, updatedAt },
          attributes
        )
        cache.persistHeadersAndReferences(messageId, headers, attributes)
        for (const [partId, content] of Object.entries(bodies)) {
          const part = M.getPartByPartId(partId, attributes)
          if (!part) {
            throw new Error("Error saving message body")
          }
          cache.persistBody(messageId, part, content)
        }
        cache.persistPartHeaders(messageId, partHeaders)
      })()
      if (!messageId) {
        throw new Error("error saving message")
      }
      return {
        accountId,
        message: { attributes, headers, partHeaders },
        messageId
      }
    },

    process({
      accountId,
      message,
      messageId
    }: {
      accountId: ID
      message: {
        attributes: MessageAttributes
        headers: cache.SerializedHeaders
        partHeaders: Record<string, cache.SerializedHeaders>
      }
      messageId: cache.ID
    }): Promise<void> {
      return withSmtpTransporter(accountId, transporter => {
        return (async () => {
          const { attributes, headers, partHeaders } = message
          const bodies = (partID: string) =>
            cache.getBody(messageId, { partID }) || undefined
          const mimeNode = serialize({
            attributes,
            headers,
            partHeaders,
            bodies
          })
          const raw = await promises.lift1<Buffer>(cb => mimeNode.build(cb))
          return transporter.sendMail({
            envelope: mimeNode.getEnvelope(),
            raw
          })
        })()
      })
    },

    failure(_error, { messageId }) {
      cache.removeMessage(messageId)
    }
  }),

  sync: handler({
    priority: LOW_PRIORITY,
    enqueue(params: { accountId: ID }) {
      return params
    },
    process({ accountId }: { accountId: ID }) {
      return withConnectionManager(accountId, connectionManager =>
        sync(accountId, connectionManager)
      )
    }
  }),

  flag: handler({
    enqueue(params: { accountId: ID; box: { name: string }; uids: number[] }) {
      cache.addFlag({ ...params, flag: "\\Flagged" })
      return params
    },

    process({
      accountId,
      box,
      uids
    }: {
      accountId: ID
      box: { name: string }
      uids: number[]
    }): Promise<void> {
      return withConnectionManager(accountId, connectionManager =>
        connectionManager
          .request(
            request.actions.addFlags(
              { name: box.name, readonly: false },
              uids,
              ["\\Flagged"]
            )
          )
          .toPromise()
      )
    },

    failure(_error, { accountId, box, uids }) {
      cache.delFlags({ accountId, box, uids, flags: ["\\Flagged"] })
    }
  }),

  unFlag: handler({
    enqueue(params: { accountId: ID; box: { name: string }; uids: number[] }) {
      cache.delFlags({ ...params, flags: ["\\Flagged"] })
      return params
    },

    process({
      accountId,
      box,
      uids
    }: {
      accountId: ID
      box: { name: string }
      uids: number[]
    }): Promise<void> {
      return withConnectionManager(accountId, connectionManager =>
        connectionManager
          .request(
            request.actions.delFlags(
              { name: box.name, readonly: false },
              uids,
              ["\\Flagged"]
            )
          )
          .toPromise()
      )
    },

    failure(_error, { accountId, box, uids }) {
      cache.addFlag({ accountId, box, uids, flag: "\\Flagged" })
    }
  })
}

const isTest = process.env.NODE_ENV

const store = isTest
  ? new SqliteStore<Task<typeof handlers>>({ memory: true })
  : new SqliteStore<Task<typeof handlers>>({
      path: getDbPath()
    })

if (process.env.NODE_ENV !== "test") {
  fs.chmodSync(getDbPath(), 0o600)
}

const queueOptions = {
  maxRetries: 3,
  maxTimeout: isTest ? 150 : Infinity,
  retryDelay: isTest ? 1 : 10000,
  store
} as const

export const { actions, queue, schedule } = combineHandlers(
  queueOptions,
  handlers
)

async function withConnectionManager<T>(
  accountId: ID,
  fn: (cm: ConnectionManager) => Promise<T>
): Promise<T> {
  const connectionManager = AccountManager.getConnectionManager(accountId)
  if (connectionManager) {
    return fn(connectionManager)
  } else {
    throw new Error(
      `could not get connection manager for account ID, ${accountId}`
    )
  }
}

async function withSmtpTransporter<T>(
  accountId: ID,
  fn: (cm: Transporter) => Promise<T>
): Promise<T> {
  const transporter = AccountManager.getSmtpTransporter(accountId)
  if (transporter) {
    return fn(transporter)
  } else {
    throw new Error(
      `could not get SMTP transporter for account ID, ${accountId}`
    )
  }
}

export function getQueuedTasks(): Array<Task<typeof handlers>> {
  return store.getAll()
}

function getDbPath() {
  const cacheDir = xdgBasedir.cache
  if (!cacheDir) {
    throw new Error(
      "Could not locate XDG cache location! Are you running without a home directory?"
    )
  }
  return path.join(cacheDir, "poodle", "queue.sqlite")
}
