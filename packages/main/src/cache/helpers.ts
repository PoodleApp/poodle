import db from "../db"
import { ID } from "./types"

export function insertInto(
  table: string,
  values: Record<string, unknown>,
  upsert?: string
): ID {
  const keys = Object.keys(values)
  const { lastInsertRowid } = db
    .prepare(
      `
        insert into ${table}
        (${keys.join(", ")}) values
        (${keys.map(k => `@${k}`).join(", ")})
        ${upsert || ""}
      `
    )
    .run(values)
  return lastInsertRowid
}
