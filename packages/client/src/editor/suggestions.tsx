import * as React from "react"
import { Plugin } from "slate-react"
import { Value } from "slate"

export function useSuggestionsPlugin({ capture }: { capture: RegExp }) {
  const [query, setQuery] = React.useState<string | null>(null)
  const plugin = React.useMemo(() => {
    const onChange: Plugin["onChange"] = (change, next) => {
      if (hasValidAncestors(change.value)) {
        const query = getCapturedValue(change.value, capture)
        // This timeout is necessary to escape a re-render paradox.
        setTimeout(() => setQuery(query), 0)
      } else {
        setTimeout(() => setQuery(null), 0)
      }
      next()
    }
    return { onChange }
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
