import {
  AppBar,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  CssBaseline,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from "@material-ui/core"
import ArchiveIcon from "@material-ui/icons/Archive"
import CloseIcon from "@material-ui/icons/Close"
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import MoreVertIcon from "@material-ui/icons/MoreVert"
import { Redirect, RouteComponentProps } from "@reach/router"
import clsx from "clsx"
import moment from "moment"
import * as React from "react"
import Avatar from "./Avatar"
import ReplyForm from "./compose/ReplyForm"
import DisplayContent from "./DisplayContent"
import DisplayErrors from "./DisplayErrors"
import * as graphql from "./generated/graphql"
import useArchive from "./hooks/useArchive"
import useSetIsRead from "./hooks/useSetIsRead"
import { displayParticipant } from "./Participant"

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
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: "rotate(180deg)"
  },
  presentable: {
    marginTop: theme.spacing(1),
    overflow: "visible"
  },
  replyForm: {
    marginTop: theme.spacing(1)
  }
}))

export default function Conversation({
  accountId,
  conversationId,
  navigate
}: Props) {
  const classes = useStyles()
  const { data, error, loading } = graphql.useGetConversationQuery({
    variables: { id: conversationId!, accountId: accountId! }
  })
  const [archive, archiveResult] = useArchive({
    accountId: accountId!,
    conversationId: conversationId!
  })
  const setIsReadResult = useSetIsRead(data && data.conversation)

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

  async function onArchive() {
    await archive()
    navigate!(`/accounts/${accountId}/dashboard`)
  }

  const {
    labels,
    presentableElements,
    replyRecipients,
    subject
  } = data.conversation

  return (
    <div className={classes.root}>
      <AppBar position="absolute" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <IconButton
            className={classes.closeButton}
            edge="start"
            color="inherit"
            aria-label="close view"
            onClick={() => navigate!(`/accounts/${accountId}/dashboard`)}
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
        <DisplayErrors results={[archiveResult, setIsReadResult]} />
        {labels
          ? labels.map(label => (
              <span className="label" key={label}>
                {label}
              </span>
            ))
          : null}
        {presentableElements.map((presentable, i) => (
          <Presentable
            key={presentable.id}
            accountId={accountId}
            conversationId={conversationId}
            presentable={presentable}
            isLast={presentableElements.length === i + 1}
          />
        ))}
        <ReplyForm
          accountId={accountId}
          conversationId={conversationId}
          className={classes.replyForm}
          replyRecipients={replyRecipients}
        />
      </main>
    </div>
  )
}

function Presentable({
  accountId,
  conversationId,
  presentable,
  isLast
}: {
  accountId: string
  conversationId: string
  presentable: graphql.Presentable
  isLast: boolean
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [editing, setEditing] = React.useState(false)

  const [expanded, setExpanded] = React.useState(
    isLast ? true : !presentable.isRead
  )

  const classes = useStyles()
  const cardContentID = `card-content-${presentable.id}`

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }

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
              aria-controls={`${presentable.id}-menu`}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <IconButton
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded
              })}
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label="Show more"
              aria-controls={cardContentID}
            >
              <ExpandMoreIcon />
            </IconButton>

            <Menu
              id={`${presentable.id}-menu`}
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
      />
      <Collapse in={expanded} timeout="auto">
        <CardContent id={cardContentID}>
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
            }
            return <DisplayContent key={i} {...content} />
          })}
        </CardContent>
      </Collapse>
    </Card>
  )
}

function displayPresentableEdited({
  editedAt,
  editedBy,
  from
}: graphql.Presentable) {
  if (!editedAt || !editedBy) {
    return ""
  }
  const editorIsntAuthor =
    editedBy.host !== from.host || editedBy.mailbox !== from.mailbox
  return `Edited ${moment(editedAt).calendar()} ${
    editorIsntAuthor ? ` by ${displayParticipant(editedBy)} ` : ""
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
  const [sendEdit] = graphql.useEditMutation()
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
