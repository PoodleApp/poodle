import * as React from "react"
import { Editor as CoreEditor, Value, Operation } from "slate"
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
import { List } from "immutable"
import { makeStyles } from "@material-ui/core"
import { createPortal } from "react-dom"

const CONTEXT_ANNOTATION_TYPE = "suggestionContext"

const capture = /(\S+(?:\s+\S+){0,4})/

type Props = EditorProps & { initialValue?: Value }

export default function Editor({
  initialValue,
  onChange,
  value,
  ...props
}: Props) {
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

  function insertMention({
    conversation,
    query,
    title
  }: typeof suggestions[number]) {
    const editor = editorRef.current
    if (!editor) {
      return
    }
    editor.deleteBackward(query.length)
    const selectedRange = editor.value.selection
    editor.insertText(" ")
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
              leaves: [
                {
                  text: conversation.subject
                }
              ]
            }
          ],
          type: CONVERSATION_LINK
        } as any
      )
      .focus()
  }

  return (
    <>
      <SlateEditor
        {...props}
        plugins={plugins}
        spellCheck
        ref={editorRef as any}
        renderAnnotation={renderAnnotation}
        renderBlock={renderBlock}
        renderInline={renderInline}
        schema={schema}
        value={value}
        onChange={(params: { operations: List<Operation>; value: Value }) => {
          // setValue(params.value)
          onChange && onChange(params)
        }}
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

const useStyles = makeStyles(_theme => ({
  suggestionsList: {
    background: "#fff",
    listStyle: "none",
    margin: 0,
    padding: 0,
    position: "absolute"
  },
  suggestion: {
    alignItems: "center",
    borderLeft: "1px solid #ddd",
    borderRight: "1px solid #ddd",
    borderTop: "1px solid #ddd",
    display: "flex",
    height: "32px",
    padding: "4px 8px"
  }
}))

type Item = { id: string; title: string }

const SuggestionList = React.forwardRef(
  (
    {
      children,
      ...props
    }: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLUListElement>,
      HTMLUListElement
    >,
    ref: React.Ref<HTMLUListElement>
  ) => {
    const classes = useStyles()
    return (
      <ul {...props} ref={ref} className={classes.suggestionsList}>
        {children}
      </ul>
    )
  }
)

function Suggestion(
  props: React.DetailedHTMLProps<
    React.LiHTMLAttributes<HTMLLIElement>,
    HTMLLIElement
  >
) {
  const classes = useStyles()
  return <li {...props} className={classes.suggestion}></li>
}

const defaultPosition = { top: -10000, left: -10000 }

function Suggestions<T extends Item>({
  anchor,
  items,
  onSelect
}: {
  anchor: string
  items: Array<T>
  onSelect: (item: T) => void
}) {
  const [position, setPosition] = React.useState(defaultPosition)
  React.useEffect(() => {
    const anchorElement = window.document.querySelector(anchor)
    if (!anchorElement) {
      setPosition(defaultPosition)
    } else {
      const anchorRect = anchorElement.getBoundingClientRect()
      setPosition({
        top: anchorRect.bottom + window.pageYOffset,
        left: anchorRect.left + window.pageXOffset
      })
    }
  })
  const root = window.document.getElementById("root")!
  return createPortal(
    <SuggestionList style={position}>
      {items.map(item => (
        <Suggestion key={item.id} onClick={() => onSelect(item)}>
          {item.title}
        </Suggestion>
      ))}
    </SuggestionList>,
    root
  )
}
