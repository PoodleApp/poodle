import {
  AppBar,
  Button,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  makeStyles,
  TextField,
  Toolbar,
  Typography
} from "@material-ui/core"
import CloseIcon from "@material-ui/icons/Close"
import { navigate } from "@reach/router"
import clsx from "clsx"
import * as React from "react"
import DisplayErrors from "../DisplayErrors"
import * as graphql from "../generated/graphql"
import RecipientsInput, { Address } from "./RecipientsInput"

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
  formInput: {
    width: "100%",
    marginBottom: theme.spacing(1)
  },
  contentInput: {
    flexGrow: 1
  }
}))

export default function Compose({ accountId }: Props) {
  const classes = useStyles()
  const [subject, setSubject] = React.useState("")
  const [recipients, setRecipients] = React.useState<Address[]>([])
  const [content, setContent] = React.useState("")
  const [error, setError] = React.useState<Error | null>(null)
  const [sendMessage, sendMessageResult] = graphql.useSendMessageMutation()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accountId) {
      setError(new Error("Could not determine which account to send from."))
      return
    }
    try {
      const message = {
        content: { type: "text", subtype: "plain", content },
        subject,
        to: recipients.map(r => ({
          name: r.name,
          mailbox: r.local,
          host: r.domain
        }))
      }
      const response = await sendMessage({
        variables: { accountId, message }
      })
      if (response && response.data) {
        const conversationId = response.data.conversations.sendMessage.id
        navigate(`/accounts/${accountId}/conversations/${conversationId}`)
      }
    } catch (error) {}
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
        <form className={classes.form} onSubmit={handleSubmit}>
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
          <TextField
            className={clsx(classes.formInput, classes.contentInput)}
            label="Message"
            fullWidth={true}
            multiline={true}
            name="content"
            onChange={event => setContent(event.target.value)}
            value={content}
            variant="outlined"
          />
          <Button color="primary" variant="contained" type="submit">
            Send
          </Button>
        </form>
      </main>
      <Dialog
        open={Boolean(error)}
        onClose={() => setError(null)}
        aria-labelledby="error-alert-title"
        aria-describedby="error-alert-description"
      >
        <DialogTitle id="error-alert-title">Could not send message</DialogTitle>
        <DialogContent>
          <DialogContentText id="error-alert-description">
            {error && error.message}
          </DialogContentText>
          <DialogActions>
            <Button onClick={() => setError(null)} color="primary" autoFocus>
              Ok
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  )
}
