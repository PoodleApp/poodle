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
import Editor from "../editor/Editor"
import serializer from "../editor/serializer"
import * as graphql from "../generated/graphql"
import ParticipantChip from "../ParticipantChip"

const initialValue = serializer.deserialize("")

type Props = React.FormHTMLAttributes<HTMLFormElement> & {
  accountId: string
  conversationId: string
  replyRecipients: graphql.Participants
  replyDraft: graphql.Message | null
}

export default function ReplyForm({
  accountId,
  conversationId,
  replyRecipients,
  replyDraft,
  ...rest
}: Props) {
  const content =
    replyDraft &&
    replyDraft.presentables &&
    replyDraft.presentables[0].contents[0].content

  console.log(content)

  const [reply, replyResult] = graphql.useReplyMutation()
  const [saveDraft, saveDraftResult] = graphql.useSaveDraftMutation()
  const [value, setValue] = React.useState(
    serializer.deserialize(content || "")
  )

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

  //TODO figure out why value is null
  function onChange() {
    console.log("changing")
    saveDraft({
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
  }

  return (
    <form onSubmit={onSubmit} {...rest}>
      <DisplayErrors results={[replyResult, saveDraftResult]} />
      <Card>
        <CardHeader
          avatar={<ReplyIcon />}
          title={<>Reply to {to}</>}
          subheader={cc.length > 0 ? <>Cc {cc}</> : null}
        />
        <CardContent>
          <Editor
            onChange={({ value }: { value: Value }) => {
              onChange()
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
