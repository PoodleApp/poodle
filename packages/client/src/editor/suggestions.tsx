import { makeStyles, MenuItem, Paper } from "@material-ui/core"
import * as Immutable from "immutable"
import pick from "object.pick"
import * as React from "react"
import { createPortal } from "react-dom"
import { Annotation, Editor, Value } from "slate"
import { Plugin, RenderAnnotationProps } from "slate-react"

const CONTEXT_ANNOTATION_TYPE = "suggestionContext"

export function useSuggestionsPlugin({ capture }: { capture: RegExp }) {
  const [query, setQuery] = React.useState<string | null>(null)
  const plugin = React.useMemo(() => {
    const onChange: Plugin["onChange"] = (editor, next) => {
      if (!hasValidAncestors(editor.value)) {
        // This timeout is necessary to escape a re-render paradox.
        setTimeout(() => setQuery(null), 0)
        return next()
      }

      const newQuery = getCapturedValue(editor.value, capture)

      // This timeout is necessary to escape a re-render paradox.
      setTimeout(() => setQuery(newQuery), 0)

      let annotations = editor.value.annotations.filter(
        (annotation: Annotation) => annotation.type !== CONTEXT_ANNOTATION_TYPE
      )

      if (newQuery) {
        const key = getMentionKey()
        const { selection } = editor.value
        annotations = annotations.set(
          key,
          Annotation.create({
            anchor: {
              key: selection.start.key,
              offset: selection.start.offset - newQuery.length
            },
            focus: {
              key: selection.start.key,
              offset: selection.start.offset
            },
            type: CONTEXT_ANNOTATION_TYPE,
            key: getMentionKey()
          })
        )
      }

      setAnnotations(editor, annotations)
      next()
    }

    const renderAnnotation: Plugin["renderAnnotation"] = (
      { annotation, attributes, children }: RenderAnnotationProps,
      _editor: Editor,
      next: () => any
    ) => {
      if (annotation.type === CONTEXT_ANNOTATION_TYPE) {
        return (
          <span {...attributes} className="mention-context">
            {children}
          </span>
        )
      }
      return next()
    }

    return { onChange, renderAnnotation }
  }, [capture, setQuery])

  return { plugin, query }
}

function getCapturedValue(value: Value, capture: RegExp): string | null {
  // In some cases, like if the node that was selected gets deleted, `startText`
  // can be `null`.
  if (!value.startText) {
    return null
  }

  const startOffset = value.selection.start.offset
  const textBefore = value.startText.text.slice(0, startOffset)
  const match = capture.exec(textBefore)
  return match && match[1]
}

/**
 * Determine if the current selection has valid ancestors for a context. In our
 * case, we want to make sure that the mention is only a direct child of a
 * paragraph. You wouldn't want it to be a child of another inline like a link.
 */
function hasValidAncestors({ document, selection }: Value): boolean {
  const startKey = selection.start.key
  const parent = startKey && document.getParent(startKey)
  return parent && "type" in parent ? parent.type === "paragraph" : false
}

let n = 0

function getMentionKey() {
  return `highlight_${n++}`
}

// Quick monkey-patch, will be unnecessary after
// https://github.com/ianstormtaylor/slate/pull/2877
;(Annotation as any).createList = Annotation.createMap

// TODO: `setAnnotations` will be a built-in editor method in the next slate
// release. See https://github.com/ianstormtaylor/slate/pull/2877
function setAnnotations(
  editor: Editor,
  annotations: Immutable.Map<string, Annotation>
) {
  const { value } = editor
  const newProperties = Value.createProperties({ annotations })
  const prevProperties = pick(value, Object.keys(newProperties) as any)

  editor.applyOperation({
    type: "set_value",
    properties: prevProperties,
    newProperties
  })
}

const useStyles = makeStyles(_theme => ({
  suggestionsList: {
    position: "absolute"
  }
}))

type Item = { id: string; title: string }

const defaultPosition = { top: -10000, left: -10000 }

export function Suggestions<T extends Item>({
  anchor,
  items,
  onSelect
}: {
  anchor: string
  items: Array<T>
  onSelect: (item: T) => void
}) {
  const classes = useStyles()
  const [position, setPosition] = React.useState(defaultPosition)
  React.useEffect(() => {
    const anchorElement = window.document.querySelector(anchor)
    if (!anchorElement || items.length < 1) {
      setPosition(defaultPosition)
    } else {
      const anchorRect = anchorElement.getBoundingClientRect()
      setPosition({
        top: anchorRect.bottom + window.pageYOffset,
        left: anchorRect.left + window.pageXOffset
      })
    }
  }, [anchor, items])
  const root = window.document.getElementById("portalRoot")!

  return createPortal(
    <Paper className={classes.suggestionsList} style={position}>
      {items.map(item => (
        <MenuItem key={item.id} onClick={() => onSelect(item)}>
          {item.title}
        </MenuItem>
      ))}
    </Paper>,
    root
  )
}
