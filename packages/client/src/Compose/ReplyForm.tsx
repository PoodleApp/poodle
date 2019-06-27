import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader
} from "@material-ui/core"
import ReplyIcon from "@material-ui/icons/Reply"
import * as React from "react"
import { Editor as CoreEditor, Value } from "slate"
import {
  Editor,
  RenderBlockProps,
  EventHook,
  RenderMarkProps
} from "slate-react"
import DisplayErrors from "../DisplayErrors"
import * as graphql from "../generated/graphql"
import ParticipantChip from "../ParticipantChip"
import serializer from "./serializer"

function MarkHotKey({ type, key }: { type: string; key: string }) {
  const onKeyDown: EventHook<KeyboardEvent> = (event, editor, next) => {
    if (!event.ctrlKey || event.key !== key) {
      return next()
    }
    event.preventDefault()
    editor.toggleMark(type)
  }
  return {
    onKeyDown
  }
}

function BlockHotKey({ type, key }: { type: string; key: string }) {
  const onKeyDown: EventHook<KeyboardEvent> = (event, editor, next) => {
    if (!event.ctrlKey || event.key !== key) {
      return next()
    }
    const isSpecialBlock = editor.value.blocks.some(
      block => block.type === type
    )
    event.preventDefault()
    editor.setBlocks(isSpecialBlock ? "paragraph" : "code")
  }
  return {
    onKeyDown
  }
}

const plugins = [
  MarkHotKey({ key: "b", type: "bold" }),
  MarkHotKey({ key: "`", type: "code" }),
  MarkHotKey({ key: "i", type: "italic" }),
  MarkHotKey({ key: "~", type: "strikethrough" }),
  MarkHotKey({ key: "u", type: "underline" })
]

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
            plugins={plugins}
            spellCheck={true}
            renderBlock={renderBlock}
            renderMark={renderMark}
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

function renderBlock(
  props: RenderBlockProps,
  _editor: CoreEditor,
  next: () => any
) {
  switch (props.node.type) {
    case "code":
      return <CodeNode {...props} />
    default:
      return next()
  }
}

function renderMark(
  props: RenderMarkProps,
  _editor: CoreEditor,
  next: () => any
) {
  const tags: Record<string, string> = {
    bold: "strong",
    code: "code",
    italic: "em",
    strikethrough: "del",
    underline: "u"
  }
  const tag = tags[props.mark.type]
  if (tag) {
    return React.createElement(tag, {
      ...props.attributes,
      children: props.children
    })
  } else {
    return next()
  }
}

function CodeNode(props: RenderBlockProps) {
  return (
    <pre {...props.attributes}>
      <code>{props.children}</code>
    </pre>
  )
}
