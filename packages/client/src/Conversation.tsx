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
import StarIcon from "@material-ui/icons/Star"
import StarBorder from "@material-ui/icons/StarBorder"
import clsx from "clsx"
import moment from "moment"
import * as React from "react"
import { useHistory } from "react-router-dom"
import Avatar from "./Avatar"
import EditForm from "./compose/EditForm"
import ReplyForm from "./compose/ReplyForm"
import DisplayContent from "./DisplayContent"
import DisplayErrors from "./DisplayErrors"
import * as graphql from "./generated/graphql"
import useArchive from "./hooks/useArchive"
import useSetIsRead from "./hooks/useSetIsRead"
import { displayParticipant } from "./Participant"
import Tooltip from "./Tooltip"

type Props = {
  accountId: string
  conversationId: string
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

export default function Conversation({ accountId, conversationId }: Props) {
  const classes = useStyles()
  const history = useHistory()
  const { data, error, loading } = graphql.useGetConversationQuery({
    variables: { id: conversationId, accountId }
  })
  const [archive, archiveResult] = useArchive({ accountId, conversationId })

  const setIsReadResult = useSetIsRead(data && data.conversation)

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
    history.push(`/accounts/${accountId}/dashboard`)
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
            onClick={() => {
              history.goBack()
            }}
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
          <Tooltip title="Archive Conversation">
            <IconButton
              color="inherit"
              aria-label="archive"
              onClick={onArchive}
            >
              <ArchiveIcon />
            </IconButton>
          </Tooltip>
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
  const [flag, flagResult] = graphql.useFlagPresentableMutation()

  const classes = useStyles()
  const cardContentID = `card-content-${presentable.id}`

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(event.currentTarget)
  }

  function handleClose() {
    setAnchorEl(null)
  }
  async function onFlag() {
    await (conversationId &&
      flag({
        variables: {
          conversationId: conversationId,
          isFlagged: !presentable.isStarred,
          presentableId: presentable.id
        }
      }))
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
              aria-controls={`menu-${presentable.id}`}
              aria-haspopup="true"
              onClick={handleClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Tooltip
              title={
                (presentable.isStarred ? "Unstar " : "Star ") + "Conversation"
              }
            >
              <IconButton
                aria-label={presentable.isStarred ? "unstar" : "star"}
                onClick={onFlag}
              >
                {presentable.isStarred ? (
                  <StarIcon style={{ fill: "gold" }} />
                ) : (
                  <StarBorder />
                )}
              </IconButton>
            </Tooltip>
            <DisplayErrors results={[flagResult]} />
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
              id={`menu-${presentable.id}`}
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
            const key = content.revision.contentId || i
            if (editing) {
              return (
                <EditForm
                  key={key}
                  accountId={accountId}
                  conversationId={conversationId}
                  contentToEdit={content}
                  onComplete={() => {
                    setEditing(false)
                  }}
                />
              )
            } else {
              return (
                <DisplayContent key={key} accountId={accountId} {...content} />
              )
            }
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
