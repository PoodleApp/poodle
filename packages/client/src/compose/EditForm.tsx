import { Button } from "@material-ui/core"
import * as React from "react"
import { Value } from "slate"
import { Editor, serializer } from "../editor"
import * as graphql from "../generated/graphql"

export default function EditForm({
  accountId,
  conversationId,
  contentToEdit,
  onComplete
}: {
  accountId: string
  conversationId: string
  contentToEdit: graphql.Content
  onComplete: () => void
}) {
  const [content, setContent] = React.useState(
    serializer.deserialize(contentToEdit.content)
  )
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const [sendEdit] = graphql.useEditMutation()
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    try {
      await sendEdit({
        variables: {
          accountId,
          conversationId,
          resource: {
            messageId: contentToEdit.resource.messageId,
            contentId: contentToEdit.resource.contentId
          },
          revision: {
            messageId: contentToEdit.revision.messageId,
            contentId: contentToEdit.revision.contentId
          },
          content: {
            type: contentToEdit.type,
            subtype: contentToEdit.subtype,
            content: serializer.serialize(content)
          }
        }
      })
      onComplete()
    } catch (error) {
      setError(error)
    }
    setLoading(false)
  }
  return (
    <form onSubmit={onSubmit}>
      {error ? <pre>{error.message}</pre> : null}
      <Editor
        onChange={({ value }: { value: Value }) => {
          setContent(value)
        }}
        value={content}
      />
      <Button disabled={loading} onClick={onComplete}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        Send Edits
      </Button>
    </form>
  )
}
