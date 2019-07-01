import { EventHook } from "slate-react"
import { Value, Block } from "slate"
import * as React from "react"

// const UP_ARROW_KEY = 38
// const DOWN_ARROW_KEY = 40
// const ENTER_KEY = 13
// const RESULT_SIZE = 5

function capturedValue(value: Value, capture: RegExp): string | null {
  const currentNode = value.blocks.first<Block>()
  const match = currentNode.text.match(capture)
  return match && match[1]
}

export default function useSuggestionsPlugin({ capture }: { capture: RegExp }) {
  const [query, setQuery] = React.useState<string | null>(null)

  const onKeyDown: EventHook<KeyboardEvent> = (_event, editor, next) => {
    // const { keyCode } = event
    const query = capturedValue(editor.value, capture)
    setQuery(query)

    // if (query) {
    //   // Up and down arrow keys will cycle through suggestions instead of usual
    //   // editor behavior.
    //   if (keyCode === UP_ARROW_KEY || keyCode === DOWN_ARROW_KEY) {
    //     event.preventDefault()
    //   }
    // }

    return next()
  }

  return { plugin: { onKeyDown }, query }
}
