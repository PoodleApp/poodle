import DB from "better-sqlite3-helper"
import electronIsDev from "electron-is-dev"
import * as fs from "fs"
import * as path from "path"
import xdgBasedir from "xdg-basedir"

const db =
  process.env.NODE_ENV === "test" ? initTestDb() : initDb(electronIsDev)

export default db

function initDb(isDev: boolean): ReturnType<typeof DB> {
  const path = getDbPath("db.sqlite", isDev)
  const instance = DB({
    path,
    migrate: {
      migrationsPath: getMigrationsPath()
    },
    WAL: false
  })
  instance.pragma("foreign_keys = ON")
  fs.chmodSync(path, 0o600)
  return instance
}

function initTestDb() {
  const instance = DB({
    memory: true,
    migrate: {
      migrationsPath: getMigrationsPath()
    },
    WAL: false
  })
  instance.pragma("foreign_keys = ON")
  return instance
}

export function getDbPath(dbName: string, isDev: boolean): string {
  const cacheDir = xdgBasedir.cache
  if (!cacheDir) {
    throw new Error(
      "Could not locate XDG cache location! Are you running without a home directory?"
    )
  }
  return path.join(cacheDir, isDev ? "poodle-dev" : "poodle", dbName)
}

function getMigrationsPath() {
  return path.join(__dirname, "..", "migrations")
}
