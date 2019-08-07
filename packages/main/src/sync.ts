import imap from "imap"
import { Collection, List, Range, Seq, Set } from "immutable"
import * as kefir from "kefir"
import moment from "moment"
import * as cache from "./cache"
import AccountManager from "./managers/AccountManager"
import ConnectionManager from "./managers/ConnectionManager"
import { getPartByPartId } from "./models/Message"
import { publishMessageUpdates } from "./pubsub"
import * as request from "./request"
import { nonNull } from "./util/array"
import * as kefirUtil from "./util/kefir"

type R<T> = kefir.Observable<T, Error>

interface BatchParams {
  uids: Collection.Indexed<number>
  batchSize?: number
  filter?: (event: request.FetchResponse) => boolean
  afterEachBatch?: (batch: Iterable<number>) => void
  fetchOptions?: imap.FetchOptions
}

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
const MAX_SEARCH_RESULTS = 30

export async function search(
  searchRecord: cache.Search,
  manager: ConnectionManager
) {
  const accountId = searchRecord.account_id
  const boxRecord = cache.getSearchedBox(searchRecord)
  const box = await manager
    .request(request.actions.getBox({ name: boxRecord.name }))
    .toPromise()
  const boxId = cache.persistBoxState(accountId, box)
  await new BoxSync({ accountId, box, boxId, manager }).search(searchRecord)
}

export async function sync(accountId: cache.ID, manager: ConnectionManager) {
  const contactApiClient = AccountManager.getContactsApiClient(
    String(accountId)
  )
  const contactSync =
    contactApiClient && contactApiClient.downloadContacts(accountId)

  await Promise.all([boxSyncer(accountId, manager), contactSync])
}

async function boxSyncer(accountId: cache.ID, manager: ConnectionManager) {
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

  async search(searchRecord: cache.Search) {
    const uids = List(
      await this.manager
        .request(
          request.actions.search(this.box, [["X-GM-RAW", searchRecord.query]])
        )
        .toPromise()
    )
      // Returned uids appear to be in ascending order, which should mean that
      // the most recent search results are at the end of the list. We want to
      // download most recent messages first.
      .reverse()
      .take(MAX_SEARCH_RESULTS)
      .map(uid => parseInt(uid, 10))

    // Add messages that have already been downloaded to result set
    cache.addSearchResults({
      search: searchRecord,
      uids,
      updatedAt: this.updatedAt
    })

    await this.downloadMissingMessages({
      uids,
      afterEachBatch: batch => {
        cache.addSearchResults({
          search: searchRecord,
          uids: batch,
          updatedAt: this.updatedAt
        })
      },
      batchSize: 1
    })
    cache.removeStaleSearchResults(searchRecord, this.updatedAt)

    // Get complete conversations
    for (const threadId of cache.getThreadIds({ uids })) {
      const threadUids = Seq(
        await this.manager
          .request(request.actions.search(this.box, [["X-GM-THRID", threadId]]))
          .toPromise()
      ).map(uid => parseInt(uid, 10))
      await this.downloadMissingMessages({ uids: threadUids })
    }

    // Make a record of the point when the search was fresh
    cache.setSearchUidLastSeen(searchRecord, this.box.uidnext - 1)

    publishMessageUpdates(null)
  }

  async sync() {
    const lastSeen = cache.lastSeenUid({ boxId: this.boxId }) || 0
    const filter = (event: request.FetchResponse) =>
      matchesCachePolicy(request.messageAttributes(event))

    // Fetch new messages
    const newMessageUids = List(
      await this.manager
        .request(
          request.actions.search(this.box, [
            ["UID", `${lastSeen + 1}:*`],
            ["SINCE", moment(cachePolicy.since).format("LL")]
          ])
        )
        .toPromise()
    )
      .map(uid => parseInt(uid, 10))
      .sort()
      .reverse()

    await this.downloadMessagesInBatches({
      uids: newMessageUids,
      filter,
      fetchOptions: {
        bodies: "HEADER",
        envelope: true,
        struct: true
      }
    })

    // Record the fact that we have checked for messages up to UID `uidnext - 1`
    cache.saveUidLastSeen({ boxId: this.boxId, uid: this.box.uidnext - 1 })

    // Flags-only fetch for updates to old messages
    const cachedUids = cache.getCachedUids({
      accountId: this.accountId,
      max: lastSeen
    })
    await this.downloadMessagesInBatches({
      uids: List(cachedUids)
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
            ["HEADER", "Message-ID", `<${messageId}>`]
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

  private async downloadMissingMessages({
    uids,
    ...rest
  }: Omit<BatchParams, "fetchOptions">) {
    const filteredUids = uids.filter(
      uid =>
        !cache.isUidPresent({
          accountId: this.accountId,
          boxId: this.boxId,
          uid
        })
    )
    return this.downloadMessagesInBatches({
      uids: filteredUids,
      fetchOptions: {
        bodies: "HEADER",
        envelope: true,
        struct: true
      },
      ...rest
    })
  }

  private async downloadMessagesInBatches({
    uids,
    batchSize = BATCH_SIZE,
    filter = () => true,
    afterEachBatch,
    fetchOptions
  }: BatchParams): Promise<void> {
    const batch = uids.take(batchSize)
    const rest = uids.skip(batchSize)
    if (batch.isEmpty()) {
      return
    }

    // TODO: it seems as though something is modifying `batch`
    const batchSnapshot = batch.toArray()

    const fetchResponses = this.manager.request(
      request.actions.fetch(this.box, fetchQuery(batch), fetchOptions)
    )

    await this.captureResponses(fetchResponses.filter(filter))
    await this.fetchMissingBodiesAndPartHeaders()
    if (afterEachBatch) {
      afterEachBatch(batchSnapshot)
    }

    await this.downloadMessagesInBatches({
      uids: rest,
      batchSize,
      filter,
      afterEachBatch,
      fetchOptions
    })
  }

  private async fetchMissingBodiesAndPartHeaders() {
    for (const { uid, part } of cache.partsMissingBodies({
      accountId: this.accountId,
      boxId: this.boxId
    })) {
      if (part.partID) {
        await this.captureResponses(
          this.manager.request(
            request.actions.fetch(this.box, String(uid), {
              bodies: [part.partID, `${part.partID}.MIME`],
              struct: true
            })
          )
        )
        publishMessageUpdates(null)
      }
    }
  }

  private async captureResponses(
    responses: R<request.FetchResponse>
  ): Promise<cache.ID[]> {
    const context = {
      accountId: this.accountId,
      boxId: this.boxId,
      updatedAt: this.updatedAt
    }
    const stream = responses.flatMap(event => {
      try {
        if (request.isMessage(event)) {
          const cacheId = cache.persistAttributes(context, event.attributes)
          return kefir.constant(cacheId)
        }

        if (request.isHeaders(event)) {
          const id = cache.persistAttributes(context, event.messageAttributes)
          cache.persistHeadersAndReferences(
            id,
            event.headers,
            event.messageAttributes
          )
        }

        if (request.isPartHeaders(event)) {
          const id = cache.persistAttributes(context, event.messageAttributes)
          cache.persistPartHeaders(id, { [event.partID]: event.headers })
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

    return (await kefirUtil.takeAll(stream)).filter(nonNull)
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

export function fetchQuery(
  uids: Collection.Indexed<number>
): string | number[] {
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
