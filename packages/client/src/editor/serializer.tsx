/*
 * The Slate editor uses its own AST representation for content. This module
 * defines how editor content is serialized to HTML, and deserialized from HTML.
 */

import Html, { Rule } from "slate-html-serializer"
import * as React from "react"

const BLOCK_TAGS: Record<string, string> = {
  p: "paragraph"
}

const rules: Rule[] = [
  // rules to handle blocks
  {
    deserialize(el, next) {
      const type = BLOCK_TAGS[el.tagName.toLowerCase()]
      if (type) {
        return {
          object: "block",
          type,
          data: {
            className: el.getAttribute("class")
          },
          nodes: next(el.childNodes)
        }
      }
    },
    serialize(obj, children) {
      if (obj.object === "block") {
        switch (obj.type) {
          case "paragraph":
            return <p className={obj.data.get("className")}>{children}</p>
          case "quote":
            return <blockquote>{children}</blockquote>
          case "code":
            return (
              <pre>
                <code>{children}</code>
              </pre>
            )
        }
      }
    }
  }
]

export default new Html({ rules })
