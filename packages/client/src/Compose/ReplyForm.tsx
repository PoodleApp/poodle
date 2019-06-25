import * as React from "react"
import { Editor } from "slate-react"
import * as graphql from "../generated/graphql"
import DisplayErrors from "../DisplayErrors"
import { Value } from "slate"
import {
  Card,
  CardContent,
  CardActions,
  Button,
  CardHeader
} from "@material-ui/core"
import ReplyIcon from "@material-ui/icons/Reply"

const initialValue = Value.fromJSON({
  document: {
    nodes: [
      {
        object: "block",
        type: "paragraph",
        nodes: []
      }
    ]
  }
})

type Props = React.FormHTMLAttributes<HTMLFormElement> & {
  accountId: string
  conversationId: string
  replyRecipients: graphql.Participants
}

export default function ReplyForm({
  accountId,
  conversationId,
  replyRecipients,
  ...rest
}: Props) {
  const [reply, replyResult] = graphql.useReplyMutation()
  const [value, setValue] = React.useState(initialValue)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await reply({
      variables: {
        accountId,
        conversationId,
        content: {
          type: "text",
          subtype: "plain",
          content: JSON.stringify(value)
        }
      }
    })
    setValue(initialValue)
  }
  return (
    <form onSubmit={onSubmit} {...rest}>
      <DisplayErrors results={[replyResult]} />
      <Card>
        <CardHeader avatar={<ReplyIcon />} title="Reply" />
        <CardContent>
          <Editor
            onChange={({ value }: { value: Value }) => setValue(value)}
            value={value}
            placeholder="Write your reply here."
          />
        </CardContent>
        <CardActions>
          <Button type="submit" disabled={replyResult.loading}>
            Send Reply
          </Button>
        </CardActions>
      </Card>
    </form>
  )
}
