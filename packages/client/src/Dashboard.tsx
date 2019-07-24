import {
  AppBar,
  Avatar as MuiAvatar,
  colors,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Toolbar,
  Tooltip,
  Typography
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import ArchiveIcon from "@material-ui/icons/Archive"
import CheckIcon from "@material-ui/icons/Check"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import MenuIcon from "@material-ui/icons/Menu"
import RefreshIcon from "@material-ui/icons/Refresh"
import StarIcon from "@material-ui/icons/Star"
import StarBorder from "@material-ui/icons/StarBorder"
import { Redirect, RouteComponentProps } from "@reach/router"
import clsx from "clsx"
import moment from "moment"
import * as React from "react"
import AccountSwitcher from "./AccountSwitcher"
import Avatar from "./Avatar"
import ComposeButton from "./ComposeButton"
import DisplayErrors from "./DisplayErrors"
import * as graphql from "./generated/graphql"
import useArchive from "./hooks/useArchive"
import * as Sel from "./hooks/useSelectedConversations"
import useSync from "./hooks/useSync"

type Props = RouteComponentProps & { accountId?: string }

const drawerWidth = 240

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
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginRight: 36
  },
  menuButtonHidden: {
    display: "none"
  },
  title: {
    flexGrow: 1
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9)
    }
  },
  appBarSpacer: theme.mixins.toolbar as any, // TODO
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto"
  }
}))

export default function Dashboard({ accountId, navigate }: Props) {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const { data, error, loading } = graphql.useGetAccountQuery({
    variables: { accountId: accountId! }
  })

  const conversations = data && data.account && data.account.conversations
  const [selected, dispatch] = Sel.useSelectedConversations(conversations)

  //if not all selected star, we want to star instead of unstar
  const isStarred =
    !!conversations &&
    conversations
      .filter(conversation =>
        selected.some(conversationId => conversation.id === conversationId)
      )
      .every(conversation => conversation.isStarred)

  // TODO: is there a way to guarantee that `accountId` is available?
  if (!accountId) {
    return <Redirect to="/accounts" />
  }

  if (loading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Error! {error.message}</div>
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      {selected.length > 0 ? (
        <SelectedActionsBar
          accountId={accountId}
          selected={selected}
          isStarred={isStarred}
        />
      ) : (
        <MainBar accountId={accountId} open={open} setOpen={setOpen} />
      )}
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={() => setOpen(false)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Conversations
          accountId={accountId}
          conversations={conversations!}
          selected={selected}
          dispatch={dispatch}
          navigate={navigate}
        />
      </main>
      <ComposeButton accountId={accountId} />
    </div>
  )
}

function MainBar({
  accountId,
  open,
  setOpen
}: {
  accountId: string
  open: boolean
  setOpen: (isOpen: boolean) => void
}) {
  const classes = useStyles()
  const [sync, syncResult] = useSync({
    accountId: accountId!
  })
  return (
    <>
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={() => setOpen(true)}
            className={clsx(
              classes.menuButton,
              open && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Inbox
          </Typography>
          <AccountSwitcher accountId={accountId} color="inherit" />
          <IconButton
            color="inherit"
            onClick={() => sync().catch(noop)}
            disabled={syncResult.loading}
          >
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DisplayErrors results={[syncResult]} />
    </>
  )
}

function SelectedActionsBar({
  accountId,
  selected,
  isStarred
}: {
  accountId: string
  selected: string[]
  isStarred: boolean
}) {
  const classes = useStyles()
  const [archive, archiveResult] = useArchive({ accountId })
  const [flag, flagResult] = graphql.useFlagMutation()

  function onArchive() {
    for (const conversationId of selected) {
      archive({ variables: { conversationId } })
    }
  }

  async function onFlag() {
    await flag({
      variables: { conversationIDs: selected, isFlagged: !isStarred }
    })
  }

  return (
    <>
      <AppBar
        position="absolute"
        color="default"
        className={clsx(classes.appBar)}
      >
        <Toolbar className={classes.toolbar}>
          <span className={classes.title} />
          <Tooltip
            title="Archive Selected Conversation"
            enterDelay={500}
            leaveDelay={200}
          >
            <IconButton aria-label="archive" onClick={onArchive}>
              <ArchiveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={(isStarred ? "Unstar " : "Star ") + "Selected Conversations"}
            enterDelay={500}
            leaveDelay={200}
          >
            <IconButton
              aria-label={isStarred ? "unstar" : "star"}
              onClick={onFlag}
            >
              {isStarred ? <StarBorder /> : <StarIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <DisplayErrors results={[archiveResult, flagResult]} />
    </>
  )
}

const useConversationRowStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.paper
  },
  message: {
    cursor: "pointer"
  },
  read: {
    backgroundColor: theme.palette.background.default
  },
  inline: {
    display: "inline"
  },
  selectedAvatar: {
    color: "#fff",
    backgroundColor: colors.blue[500]
  },
  snippetText: {
    overflow: "hidden",
    display: "-webkit-box",
    textOverflow: "ellipsis",
    "-webkit-line-clamp": 2,
    "-webkit-box-orient": "vertical"
  }
}))

type Conversation = NonNullable<
  graphql.GetAccountQuery["account"]
>["conversations"][number]

function Conversations({
  conversations,
  ...rest
}: {
  accountId: string
  conversations: Conversation[]
  selected: string[]
  dispatch: (action: Sel.Action) => void
  navigate: RouteComponentProps["navigate"]
}) {
  const classes = useConversationRowStyles()

  return (
    <Paper>
      <List className={classes.root}>
        {conversations.map((conversation, index) => {
          return (
            <React.Fragment key={conversation.id}>
              <ConversationRow conversation={conversation} {...rest} />
              {index === conversations.length - 1 ? (
                ""
              ) : (
                <Divider variant="inset" component="li" />
              )}
            </React.Fragment>
          )
        })}
      </List>
    </Paper>
  )
}

function ConversationRow({
  accountId,
  conversation,
  selected,
  dispatch,
  navigate
}: {
  accountId: string
  conversation: Conversation
  selected: string[]
  dispatch: (action: Sel.Action) => void
  navigate: RouteComponentProps["navigate"]
}) {
  const { from, date, id, isRead, snippet, subject, isStarred } = conversation

  const classes = useConversationRowStyles()
  const isSelected = selected.some(i => i === id)
  const rowId = "conversation-row-" + id
  return (
    <ListItem
      className={clsx(isRead && classes.read, classes.message)}
      alignItems="flex-start"
      onClick={() => navigate!(`/accounts/${accountId}/conversations/${id}`)}
      selected={isSelected}
    >
      <ListItemAvatar>
        {isSelected ? (
          <MuiAvatar
            role="checkbox"
            aria-checked="true"
            aria-labelledby={rowId}
            className={classes.selectedAvatar}
            onClick={event => {
              event.stopPropagation()
              dispatch(Sel.unselect(id))
            }}
          >
            <CheckIcon />
          </MuiAvatar>
        ) : (
          <Avatar
            role="checkbox"
            aria-checked="false"
            aria-labelledby={rowId}
            onClick={event => {
              event.stopPropagation()
              dispatch(Sel.select(id))
            }}
            address={from}
          />
        )}
      </ListItemAvatar>

      <ListItemText
        id={rowId}
        primary={(isStarred ? "⭐ " : "") + (subject || "[no subject]")}
        secondary={
          <>
            <Typography
              component="span"
              variant="body2"
              className={classes.inline}
              color="textPrimary"
            >
              {moment(date).calendar()}
              {"\u00A0"}
              from{" "}
              {from
                ? from.name || `${from.mailbox}@${from.host}`
                : "unknown sender"}
            </Typography>
            {` — ${snippet}`}
          </>
        }
        classes={{
          secondary: classes.snippetText
        }}
      />
    </ListItem>
  )
}

function noop() {}
