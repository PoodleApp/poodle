import isUrl from "is-url"
import { SchemaProperties } from "slate"

const schema: SchemaProperties = {
  document: {
    nodes: [
      {
        match: [{ type: "paragraph" }, { type: "image" }]
      }
    ]
  },
  blocks: {
    paragraph: {
      nodes: [{ match: { object: "text" } }]
    },
    image: {
      isVoid: true,
      data: {
        src: v => v && isUrl(v)
      }
    }
  }
}

export default schema
