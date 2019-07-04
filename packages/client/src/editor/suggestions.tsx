import * as React from "react"
import { Plugin, RenderAnnotationProps } from "slate-react"
import { Editor, Value, Annotation } from "slate"

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

      setTimeout(() => {
        editor.setAnnotations(annotations)
      }, 1)
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
