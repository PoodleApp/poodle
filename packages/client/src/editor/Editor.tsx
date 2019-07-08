import * as React from "react"
import { Editor as CoreEditor } from "slate"
import {
  Editor as SlateEditor,
  EditorProps,
  RenderBlockProps,
  RenderInlineProps
} from "slate-react"
import DisplayErrors from "../DisplayErrors"
import * as graphql from "../generated/graphql"
import { CONVERSATION_LINK, schema } from "./schema"
import { Suggestions, useSuggestionsPlugin } from "./suggestions"

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
          .filter(({ conversation }) => Boolean(conversation.subject))
          .map(({ conversation, query }) => ({
            id: conversation.id,
            title: conversation.subject!,
            conversation,
            query
          }))
      : []
  const plugins = React.useMemo(() => [plugin], [plugin])
  const editorRef = React.useRef<CoreEditor | null>(null)

  function insertMention({ conversation, query }: typeof suggestions[number]) {
    const editor = editorRef.current
    if (!editor) {
      return
    }
    editor.deleteBackward(query.length)
    const selectedRange = editor.value.selection
    editor
      .insertInlineAtRange(
        selectedRange as any,
        {
          data: {
            messageId: conversation.messageId,
            subject: conversation.subject
          },
          nodes: [
            {
              object: "text",
              text: conversation.subject
            }
          ],
          type: CONVERSATION_LINK
        } as any
      )
      .insertText(" ")
      .focus()
  }

  return (
    <>
      <SlateEditor
        {...props}
        plugins={plugins}
        spellCheck
        ref={editorRef as any}
        renderBlock={renderBlock}
        renderInline={renderInline}
        schema={schema}
      />
      <Suggestions
        anchor=".mention-context"
        items={suggestions}
        onSelect={insertMention}
      />
      <DisplayErrors results={[convSearchResult]} />
    </>
  )
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
