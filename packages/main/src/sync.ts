import imap from "imap"
import { Collection, Range, Seq, Set } from "immutable"
import * as kefir from "kefir"
import moment from "moment"
import * as cache from "./cache"
import ConnectionManager from "./managers/ConnectionManager"
import { getPartByPartId } from "./models/Message"
import { publishMessageUpdates } from "./pubsub"
import * as request from "./request"
import * as kefirUtil from "./util/kefir"
import AccountManager from "./managers/AccountManager"

type R<T> = kefir.Observable<T, Error>

const cachePolicy = {
  boxes: [{ attribute: "\\All" }],
  since:
    process.env.NODE_ENV === "test"
      ? new Date("2019-01-01")
      : moment()
          .subtract(30, "days")
          .toDate(),
  labels: ["\\Inbox", "\\Sent"]
} as const

const BATCH_SIZE = 50

export async function sync(accountId: cache.ID, manager: ConnectionManager) {
  for (const specifier of cachePolicy.boxes) {
    const box = await manager
      .request(request.actions.getBox(specifier))
      .toPromise()
    const boxId = cache.persistBoxState(accountId, box)
    await new BoxSync({
      accountId,
      box,
      boxId,
      manager
    }).sync()
  }
  const contactApiClient = AccountManager.getContactsApiClient(
    String(accountId)
  )
  contactApiClient && contactApiClient.downloadContacts(accountId)
}

class BoxSync {
  private accountId: cache.ID
  private box: imap.Box
  private boxId: cache.ID
  private manager: ConnectionManager
  private updatedAt: string

  constructor(opts: {
    accountId: cache.ID
    box: imap.Box
    boxId: cache.ID
    manager: ConnectionManager
  }) {
    this.accountId = opts.accountId
    this.box = opts.box
    this.boxId = opts.boxId
    this.manager = opts.manager
    this.updatedAt = new Date().toISOString()
  }

  async sync() {
    const lastSeen = cache.lastSeenUid({ boxId: this.boxId })
    const filter = (event: request.FetchResponse) =>
      matchesCachePolicy(request.messageAttributes(event))

    // Fetch new messages
    if (lastSeen < this.box.uidnext - 1) {
      await this.downloadMessagesInBatches({
        uids: Range(this.box.uidnext - 1, lastSeen, -1),
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
          await this.fetchMissingBodiesAndPartHeaders(batch)
        }
      })
    } else {
      await this.captureResponses(
        this.manager.request(
          request.actions.fetch(this.box, `${lastSeen + 1}:*`, {
            bodies: "HEADER",
            envelope: true,
            struct: true
          })
        )
      ).toPromise()
    }

    // Record the fact that we have checked for messages up to UID `uidnext - 1`
    cache.saveUidLastSeen({ boxId: this.boxId, uid: this.box.uidnext - 1 })

    // Flags-only fetch for updates to old messages
    const cachedUids = cache.getCachedUids({
      accountId: this.accountId,
      max: lastSeen
    })
    await this.downloadMessagesInBatches({
      uids: Seq(cachedUids)
    })

    cache.removeStaleMessages(this.boxId, this.updatedAt)
    await this.downloadCompleteConversations()

    // Check for bodies and part headers one more time in case some are missing
    // due to an interrupted sync.
    await this.fetchMissingBodiesAndPartHeaders()

    publishMessageUpdates(null)
  }

  private async downloadCompleteConversations() {
    const messageIds = cache.missingMessageIds(this.accountId)
    const missingUids = await messageIds.reduce(async (uids, messageId) => {
      const uid = await this.manager
        .request(
          request.actions.search(this.box, [
            ["HEADER", "Message-ID", messageId]
          ])
        )
        .toPromise()
      return (await uids).concat(uid)
    }, Promise.resolve(Set<string>()))
    await this.downloadMessagesInBatches({
      uids: missingUids.valueSeq().map(uid => parseInt(uid, 10)),
      fetchOptions: {
        bodies: "HEADER",
        envelope: true,
        struct: true
      }
    })
  }

  private async downloadMessagesInBatches({
    uids,
    filter = () => true,
    shouldContinue = async () => true,
    afterEachBatch,
    fetchOptions
  }: {
    uids: Seq.Indexed<number>
    filter?: (event: request.FetchResponse) => boolean
    shouldContinue?: (
      messages: R<imap.ImapMessageAttributes>
    ) => Promise<boolean>
    afterEachBatch?: (batch: Seq.Indexed<number>) => Promise<void>
    fetchOptions?: imap.FetchOptions
  }) {
    const batch = uids.take(BATCH_SIZE)
    const rest = uids.skip(BATCH_SIZE)
    if (batch.isEmpty()) {
      return
    }

    const fetchResponses = this.manager.request(
      request.actions.fetch(this.box, fetchQuery(batch), fetchOptions)
    )

    const continueToNextBatch = shouldContinue(
      fetchResponses.filter(request.isMessage).map(m => m.attributes)
    )

    await this.captureResponses(fetchResponses.filter(filter)).toPromise()

    if (afterEachBatch) {
      await afterEachBatch(batch)
    }

    if (await continueToNextBatch) {
      await this.downloadMessagesInBatches({
        uids: rest,
        filter,
        shouldContinue,
        fetchOptions
      })
    }
  }

  private async fetchMissingBodiesAndPartHeaders(
    uids?: Collection.Indexed<number>
  ) {
    for (const { uid, part } of cache.partsMissingBodies({
      accountId: this.accountId,
      boxId: this.boxId,
      uids
    })) {
      if (part.partID) {
        await this.captureResponses(
          this.manager.request(
            request.actions.fetch(this.box, String(uid), {
              bodies: [part.partID, `${part.partID}.MIME`],
              struct: true
            })
          )
        ).toPromise()
        publishMessageUpdates(null)
      }
    }
  }

  private captureResponses(responses: R<request.FetchResponse>): R<void> {
    const context = {
      accountId: this.accountId,
      boxId: this.boxId,
      updatedAt: this.updatedAt
    }
    return (
      responses
        .flatMap(event => {
          try {
            if (request.isMessage(event)) {
              cache.persistAttributes(context, event.attributes)
            }

            if (request.isHeaders(event)) {
              const id = cache.persistAttributes(
                context,
                event.messageAttributes
              )
              cache.persistHeadersAndReferences(
                id,
                event.headers,
                event.messageAttributes
              )
            }

            if (request.isPartHeaders(event)) {
              const id = cache.persistAttributes(
                context,
                event.messageAttributes
              )
              cache.persistPartHeaders(id, { [event.partID]: event.headers })
            }

            if (request.isBody(event)) {
              const id = cache.persistAttributes(
                context,
                event.messageAttributes
              )
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
}

function matchesCachePolicy(message: imap.ImapMessageAttributes): boolean {
  if (cachePolicy.labels) {
    const labels = message["x-gm-labels"] || []
    if (!cachePolicy.labels.some(label => labels.includes(label))) {
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
