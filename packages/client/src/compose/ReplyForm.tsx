import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader
} from "@material-ui/core"
import ReplyIcon from "@material-ui/icons/Reply"
import * as React from "react"
import { Value } from "slate"
import DisplayErrors from "../DisplayErrors"
import { Editor, serializer } from "../editor"
import * as graphql from "../generated/graphql"
import ParticipantChip from "../ParticipantChip"

const initialValue = serializer.deserialize("")

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
          subtype: "html",
          content: serializer.serialize(value)
        }
      }
    })
    setValue(initialValue)
  }

  const to = replyRecipients.to.map(address => (
    <ParticipantChip
      key={`${address.mailbox}@${address.host}`}
      address={address}
      nameOnly={true}
    />
  ))
  const cc = replyRecipients.cc.map(address => (
    <ParticipantChip
      key={`${address.mailbox}@${address.host}`}
      address={address}
      nameOnly={true}
    />
  ))

  return (
    <form onSubmit={onSubmit} {...rest}>
      <DisplayErrors results={[replyResult]} />
      <Card>
        <CardHeader
          avatar={<ReplyIcon />}
          title={<>Reply to {to}</>}
          subheader={cc.length > 0 ? <>Cc {cc}</> : null}
        />
        <CardContent>
          <Editor
            onChange={({ value }: { value: Value }) => {
              setValue(value)
            }}
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
