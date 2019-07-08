import isUrl from "is-url"
import { SchemaProperties } from "slate"

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
      nodes: [{ match: [{ object: "text" }, { type: CONVERSATION_LINK }] }]
    },
    image: {
      isVoid: true,
      data: {
        src: v => v && isUrl(v)
      }
    }
  },
  inlines: {
    [CONVERSATION_LINK]: {
      // Mark links as void nodes so that users can't edit the text of the node.
      isVoid: true
    }
  }
}
