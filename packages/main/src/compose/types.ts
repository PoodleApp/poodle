import { SerializedHeaders } from "../cache"
import { MessageAttributes } from "../types"

export type ComposedMessage = {
  attributes: MessageAttributes
  headers: SerializedHeaders
  bodies: Record<string, Buffer>
}
