import imap from "imap"
import * as kefir from "kefir"
import moment from "moment"
import * as cache from "./cache"
import ConnectionManager from "./managers/ConnectionManager"
import { getPartByPartId } from "./models/Message"
import * as request from "./request"

type R<T> = kefir.Observable<T, Error>

const cachePolicy = {
  boxes: [{ attribute: "\\All" }],
  since:
    process.env.NODE_ENV === "test"
      ? new Date("2019-01-01")
      : moment()
          .subtract(30, "days")
          .toDate(),
  labels: ["\\Inbox"]
} as const

const BATCH_SIZE = 50

export async function sync(accountId: cache.ID, manager: ConnectionManager) {
  for (const specifier of cachePolicy.boxes) {
    await syncBox(accountId, manager, specifier)
  }
}

async function syncBox(
  accountId: cache.ID,
  manager: ConnectionManager,
  boxSpec: request.BoxSpecifier
) {
  const box = await manager.request(request.actions.getBox(boxSpec)).toPromise()
  const boxId = cache.persistBoxState(accountId, box)
  const lastSeen = cache.lastSeenUid(accountId, box)
  const firstSeen = cache.firstSeenUid(accountId, box)
  const updatedAt = new Date().toISOString()

  await downloadMessagesInBatches(
    accountId,
    manager,
    box,
    boxId,
    updatedAt,
    lastSeen,
    box.uidnext - 1
  )

  // Flags-only fetch for updates to old messages
  if (firstSeen > 0 && lastSeen > 0) {
    await captureResponses(
      { accountId, boxId, updatedAt },
      manager.request(request.actions.fetch(box, `${firstSeen}:${lastSeen}`))
    ).toPromise()
  }

  cache.removeStaleMessages(boxId, updatedAt)

  // Check for bodies one more time in case some are missing due to an
  // interrupted sync.
  for (const { uid, part } of cache.partsMissingBodies({
    accountId,
    boxId
  })) {
    await captureResponses(
      { accountId, boxId, updatedAt },
      manager.request(
        request.actions.fetch(box, String(uid), {
          bodies: part.partID,
          struct: true
        })
      )
    ).toPromise()
  }
}

async function downloadMessagesInBatches(
  accountId: cache.ID,
  manager: ConnectionManager,
  box: imap.Box,
  boxId: cache.ID,
  updatedAt: string,
  lastSeenUid: number,
  latestUid: number
) {
  const startUid = Math.min(latestUid - BATCH_SIZE, lastSeenUid + 1)
  const { oldestMessage } = await captureResponses(
    { accountId, boxId, updatedAt },
    manager.request(
      request.actions.fetch(box, `${startUid}:${latestUid}`, {
        bodies: "HEADER",
        envelope: true,
        struct: true
      })
    )
  ).toPromise()

  for (const { uid, part } of cache.partsMissingBodies({
    accountId,
    boxId,
    minUid: startUid,
    maxUid: latestUid
  })) {
    await captureResponses(
      { accountId, boxId, updatedAt },
      manager.request(
        request.actions.fetch(box, String(uid), {
          bodies: part.partID,
          struct: true
        })
      )
    ).toPromise()
  }

  const nextLatestUid = startUid - 1
  if (
    nextLatestUid > lastSeenUid &&
    (!oldestMessage || oldestMessage.date >= cachePolicy.since)
  ) {
    await downloadMessagesInBatches(
      accountId,
      manager,
      box,
      boxId,
      updatedAt,
      lastSeenUid,
      nextLatestUid
    )
  }
}

function captureResponses(
  context: { accountId: cache.ID; boxId: cache.ID; updatedAt: string },
  responses: R<request.FetchResponse>
): R<{ oldestMessage: imap.ImapMessageAttributes | null }> {
  return responses
    .filter(event => matchesCachePolicy(request.messageAttributes(event)))
    .flatMap(event => {
      try {
        if (request.isMessage(event)) {
          cache.persistAttributes(context, event.attributes)
          return kefir.constant(event.attributes)
        }

        if (request.isHeaders(event)) {
          const id = cache.persistAttributes(context, event.messageAttributes)
          cache.persistHeadersAndReferences(id, event.headers)
        }

        if (request.isBody(event)) {
          const id = cache.persistAttributes(context, event.messageAttributes)
          const part = getPartByPartId(event.which, event.messageAttributes)
          if (part) {
            cache.persistBody(id, part, event.data)
          }
        }

        return kefir.constant(undefined)
      } catch (error) {
        return kefir.constantError(error)
      }
    })
    .scan(
      (
        accum: { oldestMessage: imap.ImapMessageAttributes | null },
        value: imap.ImapMessageAttributes | undefined
      ) => {
        if (
          value &&
          accum.oldestMessage &&
          value.date < accum.oldestMessage.date
        ) {
          return { oldestMessage: value }
        }
        return accum
      },
      { oldestMessage: null }
    )
}

function matchesCachePolicy(message: imap.ImapMessageAttributes): boolean {
  if (cachePolicy.labels) {
    const labels = message["x-gm-labels"] || []
    if (!cachePolicy.labels.every(label => labels.includes(label))) {
      return false
    }
  }

  if (cachePolicy.since) {
    if (message.date < cachePolicy.since) {
      return false
    }
  }

  return true
}
