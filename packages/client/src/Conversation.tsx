import {
  AppBar,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  makeStyles,
  Card,
  CardHeader,
  CardContent,
  Menu,
  MenuItem
} from "@material-ui/core"
import ArchiveIcon from "@material-ui/icons/Archive"
import CloseIcon from "@material-ui/icons/Close"
import MoreVertIcon from "@material-ui/icons/MoreVert"
import { navigate, Redirect, RouteComponentProps } from "@reach/router"
import moment from "moment"
import * as React from "react"
import DisplayContent from "./DisplayContent"
import * as graphql from "./generated/graphql"
import useArchive from "./hooks/useArchive"
import Participant, { displayParticipant } from "./Participant"
import Avatar from "./Avatar"

type Props = RouteComponentProps & {
  accountId?: string
  conversationId?: string
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
  edited: {
    fontStyle: "italic"
  },
  presentable: {
    marginTop: theme.spacing(2),
    overflow: "visible"
  }
}))

export default function Conversation({ accountId, conversationId }: Props) {
  const classes = useStyles()
  const { data, error, loading } = graphql.useGetConversationQuery({
    variables: { id: conversationId! }
  })
  const archive = useArchive({
    accountId: accountId!,
    conversationId: conversationId!
  })
  const setIsRead = graphql.useSetIsReadMutation({
    variables: { conversationId: conversationId!, isRead: true }
  })
  React.useEffect(() => {
    if (data && !error && !loading) {
      setIsRead()
    }
  }, [data, error, loading, setIsRead])

  // TODO: is there a way to guarantee that `accountId` and `conversationId` are available?
  if (!accountId || !conversationId) {
    return <Redirect to="/accounts" />
  }

  if (error) {
    return <div>Error! {error.message}</div>
  }
  if (loading || !data) {
    return <div>Loading...</div>
  }

  if (!data.conversation) {
    return <div>Conversation not found</div>
  }

  const { labels, presentableElements, subject } = data.conversation

  const onArchive = async () => {
    await archive()
    navigate(`/accounts/${accountId}/dashboard`)
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
            onClick={() => navigate(`/accounts/${accountId}/dashboard`)}
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
            {subject}
          </Typography>
          <IconButton color="inherit" aria-label="archive" onClick={onArchive}>
            <ArchiveIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <CssBaseline />
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        {labels
          ? labels.map(label => (
              <span className="label" key={label}>
                {label}
              </span>
            ))
          : null}
        {presentableElements.map(presentable => (
          <Presentable
            key={presentable.id}
            accountId={accountId}
            conversationId={conversationId}
            presentable={presentable}
          />
        ))}
        <ReplyForm accountId={accountId} conversationId={conversationId} />
      </main>
    </div>
  )
}

function Presentable({
  accountId,
  conversationId,
  presentable
}: {
  accountId: string
  conversationId: string
  presentable: graphql.Presentable
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [editing, setEditing] = React.useState(false)
  const classes = useStyles()

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

  //TODO: set aria-control's id
  return (
    <Card className={classes.presentable}>
      <CardHeader
        title={displayParticipant(presentable.from)}
        avatar={<Avatar address={presentable.from} />}
        subheader={
          moment(presentable.date).calendar() +
          " " +
          displayPresentableEdited(presentable)
        }
        action={
          <div>
            <IconButton
              aria-label="Action"
              aria-controls="todo"
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id="todo"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                onClick={() => {
                  setEditing(true)
                  handleClose()
                }}
              >
                Edit
              </MenuItem>
            </Menu>
          </div>
        }
        // <strong>
        //   <Participant {...presentable.from} />
        // </strong>{" "}
      />
      <CardContent>
        {presentable.contents.map((content, i) => {
          if (editing) {
            return (
              <EditForm
                accountId={accountId}
                conversationId={conversationId}
                contentToEdit={content}
                onComplete={() => {
                  setEditing(false)
                }}
              />
            )
          } else {
            return <DisplayContent key={i} {...content} />
          }
        })}
      </CardContent>
    </Card>
  )
}

function PresentableEdited({
  presentable
}: {
  presentable: graphql.Presentable
}) {
  const classes = useStyles()
  if (!presentable.editedAt || !presentable.editedBy) {
    return null
  }
  const editorIsntAuthor =
    presentable.editedBy.host !== presentable.from.host ||
    presentable.editedBy.mailbox !== presentable.from.mailbox
  return (
    <span className={classes.edited}>
      {displayPresentableEdited(presentable)}
    </span>
  )
}

function displayPresentableEdited({
  editedAt,
  editedBy,
  from
}: graphql.Presentable) {
  //const classes = useStyles()
  if (!editedAt || !editedBy) {
    return null
  }
  const editorIsntAuthor =
    editedBy.host !== from.host || editedBy.mailbox !== from.mailbox
  return `Edited ${moment(editedAt).calendar()} ${
    editorIsntAuthor ? ` by ${<Participant {...editedBy} />}` : ""
  }`
}

function EditForm({
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
  const [content, setContent] = React.useState(contentToEdit.content)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const sendEdit = graphql.useEditMutation()
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
            content
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
      <textarea onChange={e => setContent(e.target.value)} value={content} />
      <button disabled={loading} onClick={onComplete}>
        Cancel
      </button>
      <button type="submit" disabled={loading}>
        Send Edits
      </button>
    </form>
  )
}

function ReplyForm({
  accountId,
  conversationId
}: {
  accountId: string
  conversationId: string
}) {
  const [content, setContent] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const reply = graphql.useReplyMutation()
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    await reply({
      variables: {
        accountId,
        conversationId,
        content: { type: "text", subtype: "plain", content }
      }
    })
    setLoading(false)
  }
  return (
    <form onSubmit={onSubmit}>
      <textarea onChange={e => setContent(e.target.value)} value={content} />
      <button type="submit" disabled={loading}>
        Reply
      </button>
    </form>
  )
}
