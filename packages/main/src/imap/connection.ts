/*
 * Provide type-level bookkeeping for IMAP connection state
 */

import imap from "imap"
import * as kefir from "kefir"
import * as kefirUtil from "../util/kefir"
import * as promises from "../util/promises"

export type Connection = imap

export type OpenBox = {
  box: imap.Box
  connection: Connection
}

/*
 * Recursively searches boxes on an IMAP server to find one that matches the
 * given predicate. Returns an object where the `name` property is the qualified
 * name (includes parent box names, separated by delimiters), and the `box`
 * property provides some metadata.
 */
export async function findBox(
  nameOrAttrib: string,
  conn: Connection
): Promise<{ name: string; box: imap.Folder } | null | undefined> {
  const matcher = nameOrAttrib.startsWith("\\")
    ? boxByAttribute(nameOrAttrib)
    : boxByName(nameOrAttrib)
  const boxes = await promises.lift1<imap.MailBoxes>(cb => conn.getBoxes(cb))
  return findBoxByPredicate(matcher, boxes)
}

export async function openBox(
  boxName: string,
  readonly: boolean,
  connection: Connection
): Promise<OpenBox> {
  const box = await promises.lift1<imap.Box>(cb =>
    connection.openBox(boxName, readonly, cb)
  )
  return { box, connection }
}

// TODO: capability check for 'All' mailbox
export async function openAllMail(
  readonly: boolean,
  conn: Connection
): Promise<OpenBox> {
  const all = await findBox("\\All", conn)
  if (all) {
    return openBox(all.name, readonly, conn)
  } else {
    throw new Error("Could not find box for all mail")
  }
}

export async function closeBox(
  autoExpunge: boolean,
  openBox: OpenBox
): Promise<Connection> {
  await promises.lift0(cb => openBox.connection.closeBox(autoExpunge, cb))
  return openBox.connection
}

export function withBox<T, E, OT extends kefir.Observable<T, E>>(
  boxName: string,
  connection: Connection,
  readonly: boolean,
  callback: (openBox: OpenBox) => OT
): OT {
  return kefirUtil.ensure(
    kefir.fromPromise(openBox(boxName, readonly, connection)).flatMap(callback),
    () =>
      kefir.fromPromise(
        promises.lift0(cb => {
          if (activeBox(connection)) {
            connection.closeBox(cb)
          }
        })
      )
  ) as any // TODO
}

export function withAllMail<T, E, OT extends kefir.Observable<T, E>>(
  connection: Connection,
  readonly: boolean,
  callback: (openBox: OpenBox) => OT
): OT {
  return kefirUtil.ensure(
    kefir.fromPromise(openAllMail(readonly, connection)).flatMap(callback),
    () =>
      kefir.fromPromise(
        promises.lift0(cb => {
          if (activeBox(connection)) {
            connection.closeBox(cb)
          }
        })
      )
  ) as any // TODO
}

function findBoxByPredicate(
  p: (box: imap.Folder, boxName: string) => boolean,
  boxes: imap.MailBoxes,
  path: string = ""
): { box: imap.Folder; name: string } | null | undefined {
  const pairs = Object.keys(boxes).map(k => ({ name: k, box: boxes[k] }))
  const match = pairs.find(({ box, name }) => p(box, name))
  if (match) {
    const { name, box } = match
    return { name: path + name, box }
  } else {
    return pairs
      .map(({ box, name }) =>
        box.children
          ? findBoxByPredicate(p, box.children, name + box.delimiter)
          : null
      )
      .filter(child => !!child)[0]
  }
}

export function boxByAttribute(
  attribute: string
): (box: imap.Folder) => boolean {
  return box => box.attribs.some(a => a === attribute)
}

export function boxByName(
  name: string
): (_: imap.Folder, boxName: string) => boolean {
  return (_, boxName) => boxName === name
}

// Warning: this function relies on undocument internals of the imap library!
export function activeBox(connection: Connection): imap.Box | undefined {
  return (connection as any)._box
}

// Warning: this function relies on undocument internals of the imap library!
export function capabilities(connection: Connection): string[] {
  return (connection as any)._caps
}
