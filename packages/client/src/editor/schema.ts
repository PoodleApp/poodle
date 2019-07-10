import { List } from "immutable"
import isUrl from "is-url"
import { NodeJSON, SchemaProperties } from "slate"

export const CONVERSATION_LINK = "conversationLink"

export const schema: SchemaProperties = {
  document: {
    nodes: [
      {
        match: [{ type: "paragraph" }, { type: "image" }]
      }
    ]
  },
  blocks: {
    paragraph: {
      nodes: [
        {
          match: [
            { object: "text" },
            { type: "link" },
            { type: CONVERSATION_LINK }
          ]
        }
      ]
    },
    image: {
      isVoid: true,
      data: {
        src: v => v && isUrl(v)
      }
    }
  },
  inlines: {
    link: {
      data: {
        href: v => v && isUrl(v)
      },
      nodes: [{ match: [{ object: "text" }] }]
    },
    [CONVERSATION_LINK]: {
      // Mark links as void nodes so that users can't edit the text of the node.
      isVoid: true
    }
  }
}

export function conversationLink({
  messageId,
  subject,
  nodes
}: {
  messageId: string
  subject: string
  nodes: List<Node> | NodeJSON[]
}) {
  return {
    data: {
      messageId,
      subject
    },
    nodes,
    object: "inline",
    type: CONVERSATION_LINK
  } as any
}

export function link({
  href,
  nodes
}: {
  href: string
  nodes: List<Node> | NodeJSON[]
}) {
  return {
    data: { href },
    nodes,
    object: "inline",
    type: "link"
  }
}

// TODO: copied from `main/src/models/uri.ts`
export function midUri(messageId: string, contentId?: string | null): string {
  const mId = idFromHeaderValue(messageId)
  const cId = contentId && idFromHeaderValue(contentId)
  return cId
    ? `mid:${encodeURIComponent(mId)}/${encodeURIComponent(cId)}`
    : `mid:${encodeURIComponent(mId)}`
}

const messageIdPattern = /<(.*)>/

function idFromHeaderValue(id: string): string {
  return id.replace(messageIdPattern, (_, id) => id)
}
