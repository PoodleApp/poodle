import {
  AppBar,
  Avatar as MuiAvatar,
  colors,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Toolbar,
  Typography
} from "@material-ui/core"
import { red } from "@material-ui/core/colors"
import { makeStyles } from "@material-ui/core/styles"
import ArchiveIcon from "@material-ui/icons/Archive"
import CheckIcon from "@material-ui/icons/Check"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import CloseIcon from "@material-ui/icons/Close"
import MenuIcon from "@material-ui/icons/Menu"
import RefreshIcon from "@material-ui/icons/Refresh"
import SearchIcon from "@material-ui/icons/Search"
import StarIcon from "@material-ui/icons/Star"
import StarBorder from "@material-ui/icons/StarBorder"
import { Redirect, RouteComponentProps } from "@reach/router"
import clsx from "clsx"
import moment from "moment"
import * as React from "react"
import stringHash from "string-hash"
import AccountSwitcher from "./AccountSwitcher"
import Avatar from "./Avatar"
import ComposeButton from "./ComposeButton"
import DisplayErrors from "./DisplayErrors"
import * as graphql from "./generated/graphql"
import useArchive from "./hooks/useArchive"
import * as Sel from "./hooks/useSelectedConversations"
import useSync from "./hooks/useSync"
import Tooltip from "./Tooltip"

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
  searchInput: {
    fontSize: "24px",
    flexGrow: 1
  },
  toolbarSearchForm: {
    display: "flex",
    flexGrow: 1
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
  const [isSearching, setIsSearching] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const getAccountResult = graphql.useGetAccountQuery({
    variables: { accountId: accountId! }
  })
  const skipSearch = !isSearching || searchQuery.length < 3
  const searchResult = graphql.useSearchConversationsQuery({
    variables: { accountId: accountId!, query: searchQuery },
    skip: skipSearch
  })
  const conversations = skipSearch
    ? getAccountResult.data &&
      getAccountResult.data.account &&
      getAccountResult.data.account.conversations
    : searchResult.data &&
      searchResult.data.account &&
      searchResult.data.account.search.conversations

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

  return (
    <div className={classes.root}>
      <CssBaseline />
      {selected.length > 0 ? (
        <SelectedActionsBar
          accountId={accountId}
          selected={selected}
          isStarred={isStarred}
        />
      ) : isSearching ? (
        <SearchBar
          onChange={setSearchQuery}
          onClose={() => {
            setIsSearching(false)
          }}
          query={searchQuery}
        />
      ) : (
        <MainBar
          accountId={accountId}
          onSearch={() => {
            setIsSearching(true)
          }}
          open={open}
          setOpen={setOpen}
        />
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
        {conversations && conversations.length > 0 ? (
          <Conversations
            accountId={accountId}
            conversations={conversations}
            selected={selected}
            dispatch={dispatch}
            navigate={navigate}
          />
        ) : conversations ? (
          "No conversations to display"
        ) : (
          "Loading..."
        )}
      </main>
      <ComposeButton accountId={accountId} />
      <DisplayErrors results={[getAccountResult, searchResult]} />
    </div>
  )
}

function MainBar({
  accountId,
  onSearch,
  open,
  setOpen
}: {
  accountId: string
  onSearch: () => void
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
            aria-label="refresh"
            color="inherit"
            onClick={() => sync().catch(noop)}
            disabled={syncResult.loading}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton aria-label="search" color="inherit" onClick={onSearch}>
            <SearchIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <DisplayErrors results={[syncResult]} />
    </>
  )
}

function SearchBar({
  onChange,
  onClose,
  query
}: {
  onChange: (q: string) => void
  onClose: () => void
  query: string
}) {
  const classes = useStyles()
  const [value, setValue] = React.useState(query)
  return (
    <AppBar position="absolute" color="default" className={classes.appBar}>
      <Toolbar>
        <form
          className={classes.toolbarSearchForm}
          onSubmit={event => {
            event.preventDefault()
            onChange(value)
          }}
        >
          <InputBase
            autoFocus={true}
            className={classes.searchInput}
            inputProps={{
              onBlur() {
                onChange(value)
              },
              onChange(event) {
                setValue(
                  (event as React.ChangeEvent<HTMLInputElement>).target.value
                )
              },
              placeholder: "Search",
              value
            }}
          />
          <IconButton aria-label="cancel search" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </form>
      </Toolbar>
    </AppBar>
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
          <Tooltip title="Archive Selected Conversation">
            <IconButton aria-label="archive" onClick={onArchive}>
              <ArchiveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={(isStarred ? "Unstar " : "Star ") + "Selected Conversations"}
          >
            <IconButton
              aria-label={isStarred ? "unstar" : "star"}
              onClick={onFlag}
            >
              {isStarred ? (
                <StarIcon style={{ fill: "gold" }} />
              ) : (
                <StarBorder />
              )}
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
  const {
    from,
    date,
    id,
    isRead,
    snippet,
    subject,
    labels,
    isStarred
  } = conversation

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
      {labels &&
        labels.map(label => <DisplayLabel key={label} label={label} />)}
    </ListItem>
  )
}

function DisplayLabel({ label }: { label: string }) {
  const labelForDisplay = label.replace(/^\\/, "")

  const important = {
    color: red[400],
    backgroundColor: red[200],
    borderRadius: "10px",
    padding: "4.5px",
    borderColor: red[400]
  }

  function extract(shade: string) {
    return (color: any) => {
      const result = color[shade]
      return result ? [result] : []
    }
  }

  const colorMaps = Array.from(Object.values(colors))
  const primaryColors = colorMaps.flatMap(extract("300"))
  const primaryShade = colorMaps.flatMap(extract("200"))
  const primaryCount = primaryColors.length
  const shadeCount = primaryShade.length

  function getColors(id: string): [string, string] {
    const f = stringHash("fg" + id)
    const b = stringHash("bg" + id)
    return [primaryShade[f % shadeCount], primaryColors[b % primaryCount]]
  }

  const [color, backgroundColor] = getColors(labelForDisplay)
  return (
    <div>
      {labelForDisplay !== "Inbox" &&
      labelForDisplay !== "Sent" &&
      labelForDisplay !== "Starred" ? (
        labelForDisplay === "Important" ? (
          <span style={important}>{labelForDisplay}</span>
        ) : (
          <span
            style={{
              color,
              backgroundColor,
              borderRadius: "10px",
              padding: "4.5px"
            }}
          >
            {labelForDisplay}
          </span>
        )
      ) : null}
    </div>
  )
}

function noop() {}
