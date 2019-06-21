import * as React from "react"
import * as graphql from "../generated/graphql"
import Editor from "./Editor"
import DisplayErrors from "../DisplayErrors"

export default function ReplyForm({
  accountId,
  conversationId
}: {
  accountId: string
  conversationId: string
}) {
  const [content, setContent] = React.useState("")
  const [reply, replyResult] = graphql.useReplyMutation()
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await reply({
      variables: {
        accountId,
        conversationId,
        content: { type: "text", subtype: "plain", content }
      }
    })
    setContent("")
  }
  return (
    <form onSubmit={onSubmit}>
      <DisplayErrors results={[replyResult]} />
      <Editor onTextChange={setContent} />
      <button type="submit" disabled={replyResult.loading}>
        Reply
      </button>
    </form>
  )
}
