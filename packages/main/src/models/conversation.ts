import imap from "imap"
import { Collection, Seq } from "immutable"
import * as cache from "../cache"
import { uniqBy } from "../util/immutable"
import * as Addr from "./Address"

export interface Conversation {
  id: string
  messages: cache.Message[]
}

type Participants = {
  from: Collection.Indexed<imap.Address>
  to: Collection.Indexed<imap.Address>
  cc: Collection.Indexed<imap.Address>
}

export function getSubject(conversation: Conversation): string | undefined {
  const earliest = conversation.messages[0]
  return earliest.envelope_subject
}

export function getReplyParticipants(
  conversation: Conversation,
  sender: cache.Account
): Participants {
  const senderAddress = Addr.build(sender)
  const participants = getParticipants(conversation)
  const to = uniqBy(
    Addr.normalizedEmail,
    participants.from
      .concat(participants.to)
      .filter(p => !Addr.equals(senderAddress, p))
  ).sortBy(Addr.formatAddress)
  const cc = uniqBy(
    Addr.normalizedEmail,
    participants.cc.filter(
      p => !Addr.equals(senderAddress, p) && !to.some(p_ => Addr.equals(p, p_))
    )
  ).sortBy(Addr.formatAddress)
  return { to, cc, from: Seq([senderAddress]) }
}

function getParticipants(conversation: Conversation): Participants {
  const [from, to, cc] = (["from", "to", "cc"] as const).map(type =>
    Seq(conversation.messages).flatMap(message =>
      cache.getParticipants(message.id, type)
    )
  )
  return { from, to, cc }
}
