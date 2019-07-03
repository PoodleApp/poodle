import * as React from "react"
import { Editor as CoreEditor } from "slate"
import {
  Editor as SlateEditor,
  RenderAnnotationProps,
  RenderBlockProps,
  RenderInlineProps,
  EditorProps
} from "slate-react"
import DisplayErrors from "../DisplayErrors"
import * as graphql from "../generated/graphql"
import { schema, CONVERSATION_LINK } from "./schema"
import { useSuggestionsPlugin } from "./suggestions"

const CONTEXT_ANNOTATION_TYPE = "suggestionContext"

const capture = /(\S+(?:\s+\S+){0,4})/

export default function Editor(props: EditorProps) {
  const { plugin, query: conversationQuery } = useSuggestionsPlugin({ capture })
  const convSearchResult = graphql.useSearchConversationsQuery({
    skip: !conversationQuery,
    variables: { query: conversationQuery!, specificityThreshold: 2 }
  })
  const suggestions =
    conversationQuery &&
    convSearchResult.data &&
    convSearchResult.data.conversations
      ? convSearchResult.data.conversations
      : []
  const plugins = React.useMemo(() => [plugin], [plugin])
  return (
    <>
      <SlateEditor
        {...props}
        plugins={plugins}
        spellCheck
        renderAnnotation={renderAnnotation}
        renderBlock={renderBlock}
        renderInline={renderInline}
        schema={schema}
      />
      {suggestions.map(s => (
        <p key={s.id}>{s.subject}</p>
      ))}
      <DisplayErrors results={[convSearchResult]} />
    </>
  )
}

function renderAnnotation(
  { annotation, attributes, children }: RenderAnnotationProps,
  _editor: CoreEditor,
  next: () => any
) {
  if (annotation.type === CONTEXT_ANNOTATION_TYPE) {
    return (
      <span {...attributes} className="mention-context">
        {children}
      </span>
    )
  }
  return next()
}

function renderBlock(
  { attributes, children, node }: RenderBlockProps,
  _editor: CoreEditor,
  next: () => any
) {
  switch (node.type) {
    case "paragraph":
      return (
        <p {...attributes} className={node.data.get("className")}>
          {children}
        </p>
      )
    default:
      return next()
  }
}

function renderInline(
  { attributes, node }: RenderInlineProps,
  _editor: CoreEditor,
  next: () => any
) {
  if (node.type === CONVERSATION_LINK) {
    return (
      <a href="TODO" {...attributes}>
        {node.text}
      </a>
    )
  }
  return next()
}

function insertMention(conversation: graphql.Conversation) {}
