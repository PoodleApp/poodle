import {
  AppBar,
  Button,
  CssBaseline,
  IconButton,
  makeStyles,
  TextField,
  Toolbar,
  Typography
} from "@material-ui/core"
import AttachFileIcon from "@material-ui/icons/AttachFile"
import CloseIcon from "@material-ui/icons/Close"
import PhotoIcon from "@material-ui/icons/Photo"
import { navigate } from "@reach/router"
import clsx from "clsx"
import * as React from "react"
import { Value } from "slate"
import DisplayErrors from "../DisplayErrors"
import { serializer } from "../editor"
import Editor from "../editor/Editor"
import * as graphql from "../generated/graphql"
import Tooltip from "../Tooltip"
import RecipientsInput, { Address } from "./RecipientsInput"

const initialValue = serializer.deserialize("")

type Props = {
  accountId?: string
  path?: string
}

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  toolbar: {
    paddingRight: 24 // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...(theme.mixins.toolbar as any) // TODO
  },
  closeButton: {
    marginRight: 36
  },
  title: {
    flexGrow: 1
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  appBarSpacer: theme.mixins.toolbar as any, // TODO
  content: {
    display: "flex",
    flexFlow: "column",
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
    padding: theme.spacing(2)
  },
  form: {
    alignItems: "flex-end",
    display: "flex",
    flexFlow: "column",
    flexGrow: 1,
    justifyContent: "stretch"
  },
  attachment: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start"
  },
  input: {
    display: "none"
  },
  actionRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%"
  },
  formInput: {
    marginBottom: theme.spacing(1)
  },
  contentInput: {
    flexGrow: 1,
    width: "100%"
  }
}))

export default function Compose({ accountId }: Props) {
  const classes = useStyles()
  const [subject, setSubject] = React.useState("")
  const [recipients, setRecipients] = React.useState<Address[]>([])
  const [content, setContent] = React.useState(initialValue)
  const [sendMessage, sendMessageResult] = graphql.useSendMessageMutation()
  const [attachments, setAttachments] = React.useState<File[]>([])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = {
      content: {
        type: "text",
        subtype: "html",
        content: serializer.serialize(content)
      },
      subject,
      to: recipients.map(r => ({
        name: r.name,
        mailbox: r.local,
        host: r.domain
      }))
    }
    try {
      const response = await sendMessage({
        variables: { accountId: accountId!, message }
      })
      if (response && response.data) {
        const conversationId = response.data.conversations.sendMessage.id
        navigate(`/accounts/${accountId}/conversations/${conversationId}`)
      }
    } catch (error) {}
  }

  function handleAttachments(event: React.FormEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || [])
    const updatedFiles = [...attachments, ...files]
    setAttachments(updatedFiles)
  }

  return (
    <div className={classes.root}>
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            className={classes.closeButton}
            edge="start"
            color="inherit"
            aria-label="close view"
            onClick={() =>
              navigate(accountId ? `/accounts/${accountId}/dashboard` : "/")
            }
          >
            <CloseIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            New Conversation
          </Typography>
        </Toolbar>
      </AppBar>
      <CssBaseline />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <DisplayErrors results={[sendMessageResult]} />
        <form
          className={classes.form}
          onSubmit={handleSubmit}
          onKeyPress={e => {
            e.key === "Enter" && e.preventDefault()
          }}
        >
          <TextField
            className={classes.formInput}
            label="Subject"
            fullWidth={true}
            name="subject"
            onChange={event => setSubject(event.target.value)}
            value={subject}
            variant="outlined"
          />
          <RecipientsInput
            className={classes.formInput}
            label="To"
            fullWidth={true}
            name="to"
            onRecipients={setRecipients}
            variant="outlined"
          />
          <Editor
            className={clsx(classes.formInput, classes.contentInput)}
            onChange={({ value }: { value: Value }) => setContent(value)}
            placeholder="Write your message here."
            value={content}
          />
          {Attachments(attachments, classes.attachment)}
          <span className={classes.actionRow}>
            <input
              className={classes.input}
              id="add-attachment-button"
              multiple
              type="file"
              onChange={handleAttachments}
            />
            <label htmlFor="add-attachment-button">
              <Tooltip title={"Add Attachment"}>
                <IconButton component="span">
                  <AttachFileIcon />
                </IconButton>
              </Tooltip>
            </label>
            <Button color="primary" variant="contained" type="submit">
              Send
            </Button>
          </span>
        </form>
      </main>
    </div>
  )
}

function Attachments(attachments: File[], style: string) {
  return attachments.map(attachment => {
    return (
      <div className={style}>
        <PhotoIcon />
        {attachment.name}
      </div>
    )
  })
}
