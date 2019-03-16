import * as kefir from "kefir"
import * as cache from "./cache"
import ConnectionManager from "./managers/ConnectionManager"
import { getPartByPartId } from "./models/Message"
import * as request from "./request"

type R<T> = kefir.Observable<T, Error>

export async function sync(accountId: cache.ID, manager: ConnectionManager) {
  const specifiers = [{ name: "INBOX" }]
  for (const specifier of specifiers) {
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
  const newMessages = `${lastSeen + 1}:*`
  const oldMessages = `1:${lastSeen}`
  const updatedAt = new Date().toISOString()

  if (box.uidnext !== lastSeen + 1) {
    await captureResponses(
      { accountId, boxId, updatedAt },
      manager.request(
        request.actions.fetch(box, newMessages, {
          bodies: "HEADER",
          envelope: true,
          struct: true
        })
      )
    ).toPromise()
  }

  // Flags-only fetch for updates to old messages
  if (lastSeen > 0) {
    await captureResponses(
      { accountId, boxId, updatedAt },
      manager.request(request.actions.fetch(box, oldMessages))
    ).toPromise()
  }

  cache.removeStaleMessages(boxId, updatedAt)

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
