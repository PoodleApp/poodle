import * as React from "react"
import { Plugin } from "slate-react"
import { Value } from "slate"

// const UP_ARROW_KEY = 38
// const DOWN_ARROW_KEY = 40
// const ENTER_KEY = 13
// const RESULT_SIZE = 5

export function useSuggestionsPlugin({
  capture,
  onQuery,
  suggestions
}: {
  capture: RegExp
  onQuery: (q: string | null) => void
  suggestions: any
}) {
  // const onKeyDown: EventHook<KeyboardEvent> = (_event, editor, next) => {
  //   // const { keyCode } = event
  //   const query = capturedValue(editor.value, capture)
  //   onQuery(query)

  //   // if (query) {
  //   //   // Up and down arrow keys will cycle through suggestions instead of usual
  //   //   // editor behavior.
  //   //   if (keyCode === UP_ARROW_KEY || keyCode === DOWN_ARROW_KEY) {
  //   //     event.preventDefault()
  //   //   }
  //   // }

  //   return next()
  // }

  const plugin = React.useMemo(() => {
    const onChange: Plugin["onChange"] = (change, next) => {
      const query = getCapturedValue(change.value, capture)
      // This timeout is necessary to escape a re-render paradox.
      setTimeout(() => onQuery(query), 0)
      next()
    }
    return { onChange }
  }, [capture, onQuery])

  return { plugin }
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
