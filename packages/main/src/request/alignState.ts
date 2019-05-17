/*
 * Each IMAP request action specifies a connection state that it expects.
 * Functions in this module are responsible for manipulating an IMAP connection
 * to match the state that the action expects.
 */

import imap from "imap"
import Connection from "imap"
import * as C from "../imap/connection"
import * as promises from "../util/promises"
import * as B from "./MailBoxes"
import * as S from "./state"
import { BoxSpecifier } from "./types"

export default async function alignState(
  expectedState: S.ConnectionState,
  connection: Connection
): Promise<void> {
  await connect(connection)
  switch (expectedState.type) {
    case S.ANY:
      return
    case S.AUTHENTICATED:
      return closeBox(true, connection)
    case S.OPEN_BOX:
      return openBox(expectedState.box, connection)
  }
}

function connect(connection: Connection): Promise<void> {
  if (connection.state === "disconnected") {
    connection.connect()
    return new Promise((resolve, reject) => {
      connection.once("ready", () => resolve())
      connection.once("error", reject)
    })
  } else {
    return Promise.resolve()
  }
}

async function openBox(
  boxSpec: BoxSpecifier,
  connection: Connection
): Promise<void> {
  const boxName = await getBoxName(boxSpec, connection)
  const _box = C.activeBox(connection)
  const boxMatches = _box && _box.name === boxName
  const accessMatches =
    boxSpec.readonly == null || (_box && _box.readOnly === boxSpec.readonly)
  if (boxMatches && accessMatches) {
    // No change necessary
  } else {
    await closeBox(false, connection)
    await promises.lift1(cb =>
      connection.openBox(
        boxName,
        boxSpec.readonly == null ? true : boxSpec.readonly,
        cb
      )
    )
  }
}

async function closeBox(
  autoExpunge: boolean,
  connection: Connection
): Promise<void> {
  if (C.activeBox(connection)) {
    await promises.lift0(cb => connection.closeBox(autoExpunge, cb))
  }
}

async function getBoxName(
  boxSpec: BoxSpecifier,
  connection: Connection
): Promise<string> {
  const { attribute, name } = boxSpec as any
  if (name) {
    return name
  } else if (attribute) {
    try {
      const { name } = await findBox(B.byAttribute(attribute), connection)
      return name
    } catch (err) {
      throw new Error(`cannot find box with attribute, ${attribute}`)
    }
  } else {
    throw new Error(`unknown box specifier: ${JSON.stringify(boxSpec)}`)
  }
}

async function findBox(
  p: (box: imap.Folder, boxName: string) => boolean,
  connection: Connection
): Promise<{ name: string; box: imap.Folder }> {
  const boxes = await promises.lift1<imap.MailBoxes>(cb =>
    connection.getBoxes(cb)
  )
  const result = B.findBox(p, boxes)
  if (result) {
    return result
  } else {
    throw new Error("Box not found")
  }
}
