import BetterQueue from "better-queue"
import * as kefir from "kefir"
import * as path from "path"
import xdgBasedir from "xdg-basedir"
import * as cache from "../cache"
import AccountManager from "../managers/AccountManager"
import ConnectionManager from "../managers/ConnectionManager"
import * as request from "../request"
import {
  Action,
  ActionResult,
  ActionTypes,
  combineHandlers
} from "../request/combineHandlers"
import * as promises from "../util/promises"
import SqliteStore from "./better-queue-better-sqlite3"

type ID = string
type R<T> = kefir.Observable<T, Error>

export const { actions, actionTypes, perform } = combineHandlers({
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
  }
})

type Task = ActionTypes<typeof actions>

export function enqueue(action: Task): R<ActionResult<typeof action>> {
  if (action.type === actionTypes.markAsRead) {
    cache.addFlag({ ...payload(action), flag: "\\Seen" })
  } else if (action.type === actionTypes.unmarkAsRead) {
    cache.delFlags({ ...payload(action), flags: ["\\Seen"] })
  }
  const result = promises.lift1<ActionResult<typeof action>>(cb =>
    queue.push(action, cb)
  )
  return kefir.fromPromise(result)
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
      cb(e)
    },
    end() {
      cb(new Error("stream ended without a value"))
    }
  })
}

const store =
  process.env.NODE_ENV === "test"
    ? new SqliteStore<Task>({ memory: true })
    : new SqliteStore<Task>({
        path: getDbPath()
      })

export const queue = new BetterQueue<Task>(processTask, {
  maxRetries: 3,
  maxTimeout: process.env.NODE_ENV === "test" ? 150 : 10000,
  retryDelay: process.env.NODE_ENV === "test" ? 1 : 10000,
  store
})

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
