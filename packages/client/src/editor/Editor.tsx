import * as React from "react"
import { Editor as CoreEditor } from "slate"
import {
  Editor as SlateEditor,
  EditorProps,
  RenderBlockProps
} from "slate-react"
import DisplayErrors from "../DisplayErrors"
import * as graphql from "../generated/graphql"
import { schema } from "./schema"
import { useSuggestionsPlugin } from "./suggestions"

const capture = /(\S+(?:\s+\S+){0,4})/

export default function Editor(props: EditorProps) {
  const [conversationQuery, setConversationQuery] = React.useState<
    string | null
  >(null)
  const result = graphql.useSearchConversationsQuery({
    skip: !conversationQuery,
    variables: { query: conversationQuery!, specificityThreshold: 2 }
  })
  const suggestions =
    conversationQuery && result.data && result.data.conversations
      ? result.data.conversations
      : []
  const { plugin } = useSuggestionsPlugin({
    capture,
    onQuery: setConversationQuery,
    suggestions
  })
  const plugins = React.useMemo(() => [plugin], [plugin])
  return (
    <>
      <SlateEditor
        {...props}
        plugins={plugins}
        spellCheck={true}
        renderBlock={renderBlock}
        schema={schema}
      />
      {suggestions.map(s => (
        <p key={s.id}>{s.subject}</p>
      ))}
      <DisplayErrors results={[result]} />
    </>
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
