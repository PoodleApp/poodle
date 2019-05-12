import BetterQueue from "better-queue"
import Database from "better-sqlite3"
import mkdirp from "mkdirp"
import { dirname } from "path"
import uuid from "node-uuid"

type Callback<T> = ((error: Error) => void) & ((error: null, value: T) => void)

export default class SqliteStore<T> implements BetterQueue.Store<T> {
  private db: Database.Database
  private tableName: string

  constructor({
    path,
    tableName = "task",
    ...options
  }: Database.Options & { path?: string; tableName?: string }) {
    const _path = options.memory ? ":memory:" : path
    if (!_path) {
      throw new Error(
        "Provide a path for the database file or specify `memory: true`"
      )
    }
    this.tableName = tableName
    if (!options.memory) {
      mkdirp.sync(dirname(_path))
    }
    this.db = new Database(_path, options)
    this.db.exec(
      `
        CREATE TABLE IF NOT EXISTS ${
          this.tableName
        } (id TEXT UNIQUE, lock TEXT, task TEXT, priority NUMERIC, added INTEGER PRIMARY KEY AUTOINCREMENT);
        CREATE INDEX IF NOT EXISTS priorityIndex ON ${
          this.tableName
        } (lock, priority desc, added);
        PRAGMA synchronous=OFF;
        PRAGMA journal_mode=MEMORY;
        PRAGMA temp_store=MEMORY;
      `
    )
  }

  connect(cb: Callback<number>): void {
    callbackify(cb, () => {
      const results = this.db
        .prepare(`SELECT COUNT (*) FROM ${this.tableName} WHERE lock = ''`)
        .get()
      return results["COUNT (*)"]
    })
  }

  getTask(taskId: any, cb: Callback<T>): void {
    callbackify(cb, () => {
      const row = this.db
        .prepare(
          `SELECT * FROM ${this.tableName} WHERE id = @taskId AND lock = @lock`
        )
        .get({ taskId, lock: "" })
      if (row == null) {
        return null
      }
      return JSON.parse(row.task)
    })
  }

  deleteTask(taskId: any, cb: Callback<void>): void {
    callbackify(cb, () => {
      this.db
        .prepare(`DELETE FROM ${this.tableName} WHERE id = @taskId`)
        .run({ taskId })
    })
  }

  putTask(taskId: any, task: T, priority: number, cb: Callback<void>): void {
    callbackify(cb, () => {
      let serialized: string
      try {
        serialized = JSON.stringify(task)
      } catch {
        throw new Error("failed_to_serialize_task")
      }
      this.db
        .prepare(
          `
            INSERT OR REPLACE INTO ${this.tableName}
            (id, task, priority, lock) VALUES
            (@taskId, @serialized, @priority, @lock)
          `
        )
        .run({ taskId, serialized, priority, lock: "" })
    })
  }

  takeFirstN(n: number, cb: Callback<string>): void {
    return this.takeN("ORDER BY priority DESC, added ASC", n, cb)
  }

  takeLastN(n: number, cb: Callback<string>): void {
    return this.takeN("ORDER BY priority ASC, added DESC", n, cb)
  }

  private takeN(orderBy: string, n: number, cb: Callback<string>): void {
    callbackify(cb, () => {
      const lockId = uuid.v4()
      const { changes } = this.db
        .prepare(
          `
            UPDATE ${this.tableName} SET lock = @lockId
            WHERE id IN (
              SELECT id FROM ${this.tableName} WHERE lock = ''
              ${orderBy}
              LIMIT @n
            )
          `
        )
        .run({ lockId, n })
      return changes > 0 ? lockId : ""
    })
  }

  getLock(lockId: string, cb: Callback<{ [taskId: string]: T }>): void {
    callbackify(cb, () => {
      const rows = this.db
        .prepare(
          `
            SELECT id, task FROM ${this.tableName} WHERE lock = @lockId
          `
        )
        .all({ lockId: lockId || "" })
      const tasks: { [taskId: string]: T } = {}
      for (const { id, task } of rows) {
        tasks[id] = JSON.parse(task)
      }
      return tasks
    })
  }

  releaseLock(lockId: string, cb: Callback<void>): void {
    callbackify(cb, () => {
      this.db
        .prepare(
          `
            DELETE FROM ${this.tableName} WHERE lock = @lockId
          `
        )
        .run({ lockId })
    })
  }

  getRunningTasks(
    cb: Callback<{ [lockId: string]: { [taskId: string]: T } }>
  ): void {
    callbackify(cb, () => {
      const rows = this.db
        .prepare(
          `
            SELECT * FROM ${this.tableName} WHERE NOT lock = ''
          `
        )
        .all({ tableName: this.tableName })
      const tasks: { [lockId: string]: { [taskId: string]: T } } = {}
      for (const { lock, id, task } of rows) {
        tasks[lock] = tasks[lock] || {}
        tasks[lock][id] = JSON.parse(task)
      }
      return tasks
    })
  }

  getAll(): T[] {
    return this.db
      .prepare(
        `SELECT task FROM ${this.tableName} ORDER BY priority DESC, added ASC`
      )
      .all({ tableName: this.tableName })
      .map(({ task }) => JSON.parse(task))
  }
}

function callbackify<T>(cb: Callback<T>, fn: () => T) {
  try {
    cb(null, fn())
  } catch (error) {
    cb(error)
  }
}
