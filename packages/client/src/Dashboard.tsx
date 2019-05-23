import {
  AppBar,
  CssBaseline,
  IconButton,
  Toolbar,
  Typography,
  Button,
  Drawer,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from "@material-ui/core"
import { makeStyles } from "@material-ui/core/styles"
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft"
import MenuIcon from "@material-ui/icons/Menu"
import RefreshIcon from "@material-ui/icons/Refresh"
import { Link, navigate, Redirect, RouteComponentProps } from "@reach/router"
import clsx from "clsx"
import moment from "moment"
import * as React from "react"
import * as graphql from "./generated/graphql"
import useSync from "./hooks/useSync"
import Avatar from "./Avatar"
import Participant from "./Participant"

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
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  }
}))

export default function Dashboard({ accountId }: Props) {
  const classes = useStyles()
  const [open, setOpen] = React.useState(false)
  const { data, error, loading } = graphql.useGetAccountQuery({
    variables: { accountId: accountId! }
  })
  const { loading: syncLoading, sync } = useSync({
    accountId: accountId!
  })
  const [mutationError, setError] = React.useState<Error | null>(null)

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
  if (mutationError) {
    return (
      <div>
        Error! <pre>{JSON.stringify(mutationError)}</pre>
        <button onClick={() => setError(null)}>dismiss</button>
      </div>
    )
  }

  const { conversations, email } = data!.account!

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={setOpen.bind(null, !open)}
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
          <Button color="inherit" href="/accounts">
            {email}
          </Button>
          <IconButton
            color="inherit"
            onClick={() => sync().catch(setError)}
            disabled={syncLoading}
          >
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose)
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={setOpen.bind(null, !open)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Conversations accountId={accountId} conversations={conversations} />
      </main>
    </div>
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
  }
}))

type Conversation = NonNullable<
  graphql.GetAccountQuery["account"]
>["conversations"][number]

function Conversations({
  accountId,
  conversations
}: {
  accountId: string
  conversations: Conversation[]
}) {
  const classes = useConversationRowStyles()
  return (
    <Paper>
      <List className={classes.root}>
        {conversations.map(({ id, date, isRead, subject, from }, index) => (
          <React.Fragment key={index}>
            <ListItem
              key={id}
              className={clsx(isRead && classes.read, classes.message)}
              alignItems="flex-start"
              onClick={() =>
                navigate(`/accounts/${accountId}/conversations/${id}`)
              }
            >
              <ListItemAvatar>
                <Avatar address={from} />
              </ListItemAvatar>
              <ListItemText
                primary={subject || "[no subject]"}
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
                    {" — TODO: snippet"}
                  </>
                }
              >
                {date} &mdash;{" "}
                <Link to={`/accounts/${accountId}/conversations/${id}`}>
                  {subject}
                </Link>{" "}
                from <Participant {...from} />
              </ListItemText>
            </ListItem>
            {index === conversations.length - 1 ? (
              ""
            ) : (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  )
}
