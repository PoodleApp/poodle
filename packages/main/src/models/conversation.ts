import { convert } from "encoding"
import { Collection, is, List, Seq } from "immutable"
import * as cache from "../cache"
import { Content, Participants, Presentable } from "../generated/graphql"
import { uniqBy } from "../util/immutable"
import * as Addr from "./Address"
import { inlineContentParts } from "./Message"
import { idFromHeaderValue, parseMidUri } from "./uri"

export interface Conversation {
  id: string
  messages: cache.Message[]
}

export function getConversation(id: string): Conversation | null {
  return cache.getThread(id)
}

export function mustGetConversation(id: string): Conversation {
  const conversation = getConversation(id)
  if (!conversation) {
    throw new Error(`Cannot find conversation with ID, ${id}`)
  }
  return conversation
}

export function getSubject(conversation: Conversation): string | undefined {
  const earliest = conversation.messages[0]
  return earliest.envelope_subject
}

export function getReplyParticipants(
  conversation: Conversation,
  sender: cache.Account
): Participants {
  const senderAddress = Addr.build(sender)!
  const participants = getParticipants(conversation)
  const to = participants.replyTo
    ? uniqBy(
        Addr.normalizedEmail,
        List(
          participants.replyTo
            .concat(participants.to)
            .filter(p => !Addr.equals(senderAddress, p))
        )
      )
        .sortBy(Addr.formatAddress)
        .toArray()
    : []

  const cc = to
    ? uniqBy(
        Addr.normalizedEmail,
        List(
          participants.cc.filter(
            p =>
              !Addr.equals(senderAddress, p) &&
              !to.some(p_ => Addr.equals(p, p_))
          )
        )
      )
        .sortBy(Addr.formatAddress)
        .toArray()
    : []

  return { to, cc, from: [senderAddress] }
}

function getParticipants(conversation: Conversation): Participants {
  const [to, cc, replyTo] = (["to", "cc", "replyTo"] as const).map(type =>
    Seq(conversation.messages)
      .flatMap(message => {
        if (type === "replyTo") {
          const replyParts = cache.getParticipants(message.id, type)
          return replyParts.length !== 0
            ? replyParts
            : cache.getParticipants(message.id, "from")
        }
        return cache.getParticipants(message.id, type)
      })
      .toArray()
  )
  return { to, cc, replyTo }
}

type PartSpec = { messageId: string; contentId: string | null | undefined }
type Revision = { message: cache.Message; part: cache.MessagePart }
type Edit = {
  resource: PartSpec
  old: List<PartSpec>
  new: PartSpec
  result: Revision
}

export function getPresentableElements({
  messages
}: Conversation): Collection.Indexed<Presentable> {
  const initialContents = Seq(messages).flatMap(getContentParts)
  const edits = Seq(messages).flatMap(getEdits)
  const editedContents = initialContents.map(resource => ({
    resource,
    revision: walkGraph(edits, List([resource]), resource).lastNonConflict
  }))
  return editedContents
    .groupBy(({ resource }) => resource.message)
    .entrySeq()
    .map(([message, resources]) => {
      const latestEdit = resources
        .filter(isEdited)
        .sortBy(r => r.revision.message.date)
        .last(undefined)
      return {
        id: String(message.id),
        contents: resources
          .valueSeq()
          .map(getPresentableContent)
          .toArray(),
        date: message.date,
        from: cache.getParticipants(message.id, "from")[0],
        editedAt: latestEdit && latestEdit.revision.message.date,
        editedBy:
          latestEdit &&
          cache.getParticipants(latestEdit.revision.message.id, "from")[0]
      }
    })
}

function getContentParts(message: cache.Message): List<Revision> {
  return inlineContentParts(cache.getStruct(message.id)).map(part => {
    const cachedPart =
      part.partID &&
      cache.getPartByPartId({ messageId: message.id, partId: part.partID })
    if (!cachedPart) {
      throw new Error("could not get message part from cache")
    }
    return {
      message,
      part: cachedPart
    }
  })
}

function walkGraphOneStep(
  edges: Collection.Indexed<Edit>,
  start: Revision
): List<Revision> {
  return edges.reduce((finishes, edge) => {
    if (
      start.part.content_id &&
      edge.old.some(
        ({ messageId, contentId }) =>
          compareIds(messageId, start.message.envelope_messageId) &&
          compareIds(contentId, start.part.content_id)
      )
    ) {
      return finishes.push(edge.result)
    } else {
      return finishes
    }
  }, List())
}

function walkGraph(
  edges: Collection.Indexed<Edit>,
  starts: Collection.Indexed<Revision>,
  lastNonConflict: Revision
): { finishes: List<Revision>; lastNonConflict: Revision } {
  const finishes = List(
    uniqBy(
      revision =>
        List([revision.message.envelope_messageId, revision.part.content_id]),
      starts.flatMap(start => walkGraphOneStep(edges, start))
    )
  )
  const nonConflict =
    finishes.size === 1 ? finishes.first<Revision>() : lastNonConflict
  return is(starts, finishes)
    ? { finishes, lastNonConflict: nonConflict }
    : walkGraph(edges, finishes, nonConflict)
}

function getEdits(message: cache.Message): List<Edit> {
  return List(cache.getEditsFromMessage(message.id)).flatMap(part => {
    const rev = parseReplaces(message, part)
    return rev ? [rev] : []
  })
}

function parseReplaces(
  message: cache.Message,
  part: cache.MessagePart & { replaces: string }
): Edit | null {
  const json = JSON.parse(part.replaces)
  const values = parseReplacesValues(json)
  const resourceRaw: string | undefined = json.params && json.params.resource
  // TODO: change this so that `resource` param is required
  const resource = resourceRaw
    ? parsePartSpec(resourceRaw)
    : parsePartSpec(values && values[0])
  const old =
    values &&
    List(values).flatMap(value => {
      const parsed = parsePartSpec(value)
      return parsed ? [parsed] : []
    })
  if (old && !old.isEmpty() && resource && part.content_id) {
    return {
      resource,
      old,
      new: {
        messageId: message.envelope_messageId,
        contentId: part.content_id
      },
      result: { message, part }
    }
  } else {
    return null
  }
}

function parseReplacesValues(
  json: string | { value: string | string[] }
): string[] | null {
  if (typeof json === "string") {
    return [json]
  }
  if (typeof json.value === "string") {
    return [json.value]
  }
  if (Array.isArray(json.value)) {
    return json.value
  }
  return null
}

function parsePartSpec(value: string | null | undefined): PartSpec | null {
  const parsed = value && parseMidUri(idFromHeaderValue(value))
  if (parsed && parsed.messageId && parsed.contentId) {
    return {
      messageId: parsed.messageId,
      contentId: parsed.contentId
    }
  }
  return null
}

function getPresentableContent({
  resource,
  revision
}: {
  resource: Revision
  revision: Revision
}): Content {
  const { message, part } = revision
  const content = cache.getBody(message.id, part)
  const charset = part.params_charset
  const decoded =
    content && (charset ? convert(content, "utf8", charset) : content)
  const contentMeta = decoded
    ? {
        type: part.type || "text",
        subtype: part.subtype || "plain",
        content: decoded.toString("utf8")
      }
    : fallbackContent()
  return {
    ...contentMeta,
    resource: partSpec(resource),
    revision: partSpec(revision)
  }
}

function fallbackContent() {
  return {
    type: "text",
    subtype: "plain",
    content: "[content missing]"
  }
}

function partSpec({ message, part }: Revision): PartSpec {
  return {
    messageId: message.envelope_messageId,
    contentId: part.content_id
  }
}

const angleBracketPattern = /^<(.*)>$/

function compareIds(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  if (!a || !b) {
    return false
  }
  return (
    a.replace(angleBracketPattern, "$1") ===
    b.replace(angleBracketPattern, "$1")
  )
}

function isEdited({
  resource,
  revision
}: {
  resource: Revision
  revision: Revision
}): boolean {
  return resource !== revision
}
