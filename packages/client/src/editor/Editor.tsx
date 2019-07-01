import * as React from "react"
import { Editor as CoreEditor } from "slate"
import {
  Editor as SlateEditor,
  EditorProps,
  RenderBlockProps
} from "slate-react"
import schema from "./schema"
import SuggestionsPlugin from "./suggestions"

const plugins = [SuggestionsPlugin({ capture: /(\S+(?:\s+\S+){0,4})/ })]

export default function Editor(props: EditorProps) {
  return (
    <SlateEditor
      {...props}
      plugins={plugins}
      spellCheck={true}
      renderBlock={renderBlock}
      schema={schema}
    />
  )
}

function renderBlock(
  props: RenderBlockProps,
  _editor: CoreEditor,
  next: () => any
) {
  switch (props.node.type) {
    case "paragraph":
      return (
        <p {...props.attributes} className={props.node.data.get("className")}>
          {props.children}
        </p>
      )
    default:
      return next()
  }
}
