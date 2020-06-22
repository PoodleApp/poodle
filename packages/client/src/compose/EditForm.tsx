import { Button } from "@material-ui/core"
import * as React from "react"
import { Node } from "slate"
import DisplayErrors from "../DisplayErrors"
import { Editor, deserialize, serialize } from "../editor"
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
  const [content, setContent] = React.useState<Node[]>(
    contentToEdit.content
      ? deserialize(contentToEdit.content)
      : deserialize("")
  )
  const [sendEdit, sendEditResult] = graphql.useEditMutation()
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
          content: serialize(content)
        }
      }
    })
    onComplete()
  }
  return (
    <form onSubmit={onSubmit}>
      <Editor onChange={setContent} value={content} />
      <Button disabled={sendEditResult.loading} onClick={onComplete}>
        Cancel
      </Button>
      <Button type="submit" disabled={sendEditResult.loading}>
        Send Edits
      </Button>
      <DisplayErrors results={[sendEditResult]} />
    </form>
  )
}
