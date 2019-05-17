import DB from "better-sqlite3-helper"
import * as fs from "fs"
import * as path from "path"
import xdgBasedir from "xdg-basedir"

const db = process.env.NODE_ENV === "test" ? initTestDb() : initDb()
db.pragma("foreign_keys = ON")

if (process.env.NODE_ENV !== "test") {
  fs.chmodSync(getDbPath(), 0o600)
}

export default db

function initDb() {
  return DB({
    path: getDbPath(),
    migrate: {
      migrationsPath: getMigrationsPath()
    },
    WAL: false
  })
}

function initTestDb() {
  return DB({
    memory: true,
    migrate: {
      migrationsPath: getMigrationsPath()
    },
    WAL: false
  })
}

function getDbPath() {
  const cacheDir = xdgBasedir.cache
  if (!cacheDir) {
    throw new Error(
      "Could not locate XDG cache location! Are you running without a home directory?"
    )
  }
  return path.join(cacheDir, "poodle", "db.sqlite")
}

function getMigrationsPath() {
  return path.join(__dirname, "..", "migrations")
}
