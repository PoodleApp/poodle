import * as React from "react"
import { Editor as SlateEditor } from "slate-react"
import { Value } from "slate"

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: "block",
        type: "paragraph",
        nodes: [
          {
            object: "text",
            text: "A line of text in a paragraph."
          }
        ]
      }
    ]
  }
})

type Props = {
  onTextChange(text: string): void
}

export default function Editor({ onTextChange }: Props) {
  const [value, setValue] = React.useState(initialValue)
  React.useEffect(() => {
    onTextChange(JSON.stringify(value))
  }, [onTextChange, value])
  return (
    <SlateEditor
      onChange={({ value }: { value: Value }) => setValue(value)}
      value={value}
    />
  )
}
