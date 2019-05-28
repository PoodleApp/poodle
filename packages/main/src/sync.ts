import imap from "imap"
import { Range, Seq, Set } from "immutable"
import * as kefir from "kefir"
import moment from "moment"
import * as cache from "./cache"
import ConnectionManager from "./managers/ConnectionManager"
import { getPartByPartId } from "./models/Message"
import { publishMessageUpdates } from "./pubsub"
import * as request from "./request"
import * as kefirUtil from "./util/kefir"

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
  const lastSeen = cache.lastSeenUid({ boxId })
  const updatedAt = new Date().toISOString()
  const filter = (event: request.FetchResponse) =>
    matchesCachePolicy(request.messageAttributes(event))

  // Fetch new messages
  if (lastSeen < box.uidnext - 1) {
    await downloadMessagesInBatches({
      accountId,
      manager,
      box,
      boxId,
      updatedAt,
      uids: Range(box.uidnext - 1, lastSeen, -1),
      filter,
      shouldContinue: async messagesStream => {
        const messages = await kefirUtil.takeAll(messagesStream).toPromise()
        const oldestDate = Seq(messages)
          .map(message => message.date)
          .sort()
          .reverse()
          .first(null)
        return !oldestDate || oldestDate >= cachePolicy.since
      },
      fetchOptions: {
        bodies: "HEADER",
        envelope: true,
        struct: true
      },
      afterEachBatch: async batch => {
        for (const { uid, part } of cache.partsMissingBodies({
          accountId,
          boxId,
          uids: batch
        })) {
          await captureResponses(
            { accountId, boxId, updatedAt },
            manager
              .request(
                request.actions.fetch(box, String(uid), {
                  bodies: part.partID,
                  struct: true
                })
              )
              .filter(filter)
          ).toPromise()
          publishMessageUpdates(null)
        }
      }
    })
  } else {
    await captureResponses(
      { accountId, boxId, updatedAt },
      manager.request(
        request.actions.fetch(box, `${lastSeen + 1}:*`, {
          bodies: "HEADER",
          envelope: true,
          struct: true
        })
      )
    ).toPromise()
  }

  // Record the fact that we have checked for messages up to UID `uidnext - 1`
  cache.saveUidLastSeen({ boxId, uid: box.uidnext - 1 })

  // Flags-only fetch for updates to old messages
  const cachedUids = cache.getCachedUids({ accountId, max: lastSeen })
  await downloadMessagesInBatches({
    accountId,
    manager,
    box,
    boxId,
    updatedAt,
    uids: Seq(cachedUids)
  })

  cache.removeStaleMessages(boxId, updatedAt)
  await downloadCompleteConversations(accountId, manager, box, boxId, updatedAt)

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

  publishMessageUpdates(null)
}

async function downloadCompleteConversations(
  accountId: cache.ID,
  manager: ConnectionManager,
  box: imap.Box,
  boxId: cache.ID,
  updatedAt: string
) {
  const messageIds = cache.missingMessageIds(accountId)
  const missingUids = await messageIds.reduce(async (uids, messageId) => {
    const uid = await manager
      .request(
        request.actions.search(box, [["HEADER", "Message-ID", messageId]])
      )
      .toPromise()
    return (await uids).concat(uid)
  }, Promise.resolve(Set<string>()))
  await downloadMessagesInBatches({
    accountId,
    manager,
    box,
    boxId,
    updatedAt,
    uids: missingUids.valueSeq().map(uid => parseInt(uid, 10)),
    fetchOptions: {
      bodies: "HEADER",
      envelope: true,
      struct: true
    }
  })
}

async function downloadMessagesInBatches({
  accountId,
  manager,
  box,
  boxId,
  updatedAt,
  uids,
  filter = () => true,
  shouldContinue = async () => true,
  afterEachBatch,
  fetchOptions
}: {
  accountId: cache.ID
  manager: ConnectionManager
  box: imap.Box
  boxId: cache.ID
  updatedAt: string
  uids: Seq.Indexed<number>
  filter?: (event: request.FetchResponse) => boolean
  shouldContinue?: (messages: R<imap.ImapMessageAttributes>) => Promise<boolean>
  afterEachBatch?: (batch: Seq.Indexed<number>) => Promise<void>
  fetchOptions?: imap.FetchOptions
}) {
  const batch = uids.take(BATCH_SIZE)
  const rest = uids.skip(BATCH_SIZE)
  if (batch.isEmpty()) {
    return
  }

  const fetchResponses = manager.request(
    request.actions.fetch(box, fetchQuery(batch), fetchOptions)
  )

  const continueToNextBatch = shouldContinue(
    fetchResponses.filter(request.isMessage).map(m => m.attributes)
  )

  await captureResponses(
    { accountId, boxId, updatedAt },
    fetchResponses.filter(filter)
  ).toPromise()

  if (afterEachBatch) {
    await afterEachBatch(batch)
  }

  if (await continueToNextBatch) {
    await downloadMessagesInBatches({
      accountId,
      manager,
      box,
      boxId,
      updatedAt,
      uids: rest,
      filter,
      shouldContinue,
      fetchOptions
    })
  }
}

export function fetchQuery(uids: Seq.Indexed<number>): string | number[] {
  if (uids instanceof Range) {
    const {
      _start,
      _end,
      _step
    }: { _start: number; _end: number; _step: number } = uids as any
    if (_step === -1 && _end + 1 < _start) {
      return `${_end + 1}:${_start}`
    }
    if (_step === 1 && _start < _end - 1) {
      return `${_start}:${_end - 1}`
    }
  }
  return uids.toArray()
}

function captureResponses(
  context: { accountId: cache.ID; boxId: cache.ID; updatedAt: string },
  responses: R<request.FetchResponse>
): R<void> {
  return (
    responses
      .flatMap(event => {
        try {
          if (request.isMessage(event)) {
            cache.persistAttributes(context, event.attributes)
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
      // Insert a value before the end of the stream so that calling
      // `.toPromise()` resolves to a value in case the responses stream is empty.
      .beforeEnd(() => undefined)
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
