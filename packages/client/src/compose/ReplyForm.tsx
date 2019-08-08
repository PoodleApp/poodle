import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton
} from "@material-ui/core"
import AttachFileIcon from "@material-ui/icons/AttachFile"
import ReplyIcon from "@material-ui/icons/Reply"
import * as React from "react"
import { Value } from "slate"
import DisplayErrors from "../DisplayErrors"
import Editor from "../editor/Editor"
import serializer from "../editor/serializer"
import * as graphql from "../generated/graphql"
import ParticipantChip from "../ParticipantChip"
import { makeStyles } from "@material-ui/styles"
import Tooltip from "../Tooltip"

const useStyles = makeStyles(_theme => ({
  input: {
    display: "none"
  },
  attachButton: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
}))

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
  const classes = useStyles()
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
        <CardActions className={classes.attachButton}>
          <Button type="submit" disabled={replyResult.loading}>
            Send Reply
          </Button>
          <input
            accept="image/*"
            className={classes.input}
            id="add-attachment-button"
            multiple
            type="file"
          />
          <label htmlFor="add-attachment-button">
            <Tooltip title={"Add Attachment"}>
              <IconButton component="span">
                <AttachFileIcon />
              </IconButton>
            </Tooltip>
          </label>
        </CardActions>
      </Card>
    </form>
  )
}
