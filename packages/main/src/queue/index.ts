import BetterQueue from "better-queue"
import { Transporter } from "nodemailer"
import db from "../db"
import * as fs from "fs"
import * as kefir from "kefir"
import * as path from "path"
import xdgBasedir from "xdg-basedir"
import * as cache from "../cache"
import { serialize } from "../compose"
import AccountManager from "../managers/AccountManager"
import ConnectionManager from "../managers/ConnectionManager"
import * as M from "../models/Message"
import * as request from "../request"
import {
  Action,
  ActionResult,
  ActionTypes,
  combineHandlers
} from "../request/combineHandlers"
import { MessageAttributes } from "../types"
import * as promises from "../util/promises"
import SqliteStore from "./better-queue-better-sqlite3"

type ID = string
type R<T> = kefir.Observable<T, Error>

export const { actions, actionTypes, perform } = combineHandlers({
  archive(
    _context: unknown,
    {
      accountId,
      box,
      uids
    }: { accountId: ID; box: { name: string }; uids: number[] }
  ): R<void> {
    return withConnectionManager(accountId, connectionManager =>
      connectionManager.request(
        request.actions.delLabels({ name: box.name, readonly: false }, uids, [
          "\\Inbox"
        ])
      )
    )
  },

  markAsRead(
    _context: unknown,
    {
      accountId,
      box,
      uids
    }: { accountId: ID; box: { name: string }; uids: number[] }
  ): R<void> {
    return withConnectionManager(accountId, connectionManager =>
      connectionManager.request(
        request.actions.addFlags({ name: box.name, readonly: false }, uids, [
          "\\Seen"
        ])
      )
    )
  },

  unmarkAsRead(
    _context: unknown,
    {
      accountId,
      box,
      uids
    }: { accountId: ID; box: { name: string }; uids: number[] }
  ): R<void> {
    return withConnectionManager(accountId, connectionManager =>
      connectionManager.request(
        request.actions.delFlags({ name: box.name, readonly: false }, uids, [
          "\\Seen"
        ])
      )
    )
  },

  sendMessage(
    _context: unknown,
    {
      accountId,
      message
    }: {
      accountId: ID
      message: {
        attributes: MessageAttributes
        headers: cache.SerializedHeaders
        bodies: Record<string, Buffer>
      }
    },
    messageId?: ID
  ): R<void> {
    if (!messageId) {
      return kefir.constantError(new Error("message ID is missing"))
    }
    return withSmtpTransporter(accountId, transporter => {
      return kefir.fromPromise(
        (async () => {
          const { attributes, headers } = message
          const bodies = (partID: string) =>
            cache.getBody(messageId, { partID }) || undefined
          const mimeNode = serialize({ attributes, headers, bodies })
          const raw = await promises.lift1<Buffer>(cb => mimeNode.build(cb))
          return transporter.sendMail({
            envelope: mimeNode.getEnvelope(),
            raw
          })
        })()
      )
    })
  }
})

type Task = ActionTypes<typeof actions>

export function enqueue(action: Task): Promise<ActionResult<typeof action>> {
  let extra: unknown[] = []
  switch (action.type) {
    case actionTypes.archive:
      cache.delLabels({ ...payload(action), labels: ["\\Inbox"] })
      break
    case actionTypes.markAsRead:
      cache.addFlag({ ...payload(action), flag: "\\Seen" })
      break
    case actionTypes.unmarkAsRead:
      cache.delFlags({ ...payload(action), flags: ["\\Seen"] })
      break
    case actionTypes.sendMessage:
      db.transaction(() => {
        const {
          accountId,
          message: { attributes, headers, bodies }
        } = payload(action)
        const updatedAt = new Date().toISOString()
        const messageId = cache.persistAttributes(
          { accountId, updatedAt },
          attributes
        )
        extra = [messageId]
        cache.persistHeadersAndReferences(messageId, headers)
        for (const [partId, content] of Object.entries(bodies)) {
          const part = M.getPartByPartId(partId, attributes)
          if (!part) {
            throw new Error("Error saving message body")
          }
          cache.persistBody(messageId, part, content)
        }
      })()
      break
  }
  return promises.lift1<ActionResult<typeof action>>(cb =>
    queue.push(
      { ...action, payload: (action.payload as any).concat(extra) },
      cb
    )
  )
}

class JobFailure extends Error {
  constructor(cause: Error, public task: Task) {
    super(cause.message)
    Object.assign(this, cause)
  }
}

function onFailure(
  _taskId: string,
  { task }: JobFailure,
  _stats: { elapsed: number }
) {
  switch (task.type) {
    case actionTypes.sendMessage:
      const messageId = task.payload[1]
      if (messageId) {
        cache.removeMessage(messageId)
      }
      break
  }
}

function withConnectionManager<T>(
  accountId: ID,
  fn: (cm: ConnectionManager) => R<T>
): R<T> {
  const connectionManager = AccountManager.getConnectionManager(accountId)
  if (connectionManager) {
    return fn(connectionManager)
  } else {
    return kefir.constantError(
      new Error(`could not get connection manager for account ID, ${accountId}`)
    )
  }
}

function withSmtpTransporter<T>(
  accountId: ID,
  fn: (cm: Transporter) => R<T>
): R<T> {
  const transporter = AccountManager.getSmtpTransporter(accountId)
  if (transporter) {
    return fn(transporter)
  } else {
    return kefir.constantError(
      new Error(`could not get SMTP transporter for account ID, ${accountId}`)
    )
  }
}

function processTask(
  task: Task,
  cb: ((error: Error) => void) &
    ((error: null, result: ActionResult<typeof task>) => void)
) {
  perform(1, task).observe({
    value(v) {
      cb(null, v)
    },
    error(e) {
      cb(new JobFailure(e, task))
    },
    end() {
      cb(new JobFailure(new Error("stream ended without a value"), task))
    }
  })
}

const isTest = process.env.NODE_ENV

const store = isTest
  ? new SqliteStore<Task>({ memory: true })
  : new SqliteStore<Task>({
      path: getDbPath()
    })

if (process.env.NODE_ENV !== "test") {
  fs.chmodSync(getDbPath(), 0o600)
}

export const queue = new BetterQueue<Task>(processTask, {
  maxRetries: 3,
  maxTimeout: isTest ? 150 : 10000,
  retryDelay: isTest ? 1 : 10000,
  store
})

queue.on("task_failed", onFailure)

export function getQueuedTasks(): Array<Action<unknown>> {
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

function payload<T extends Task>(action: T): T["payload"][0] {
  return action.payload[0]
}
