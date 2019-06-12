import { Link, RouteComponentProps } from "@reach/router"
import * as React from "react"
import * as graphql from "./generated/graphql"
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"
import DeleteIcon from "@material-ui/icons/Delete"
import {
  AppBar,
  Fab,
  Typography,
  TextField,
  Card,
  CardHeader,
  IconButton,
  CardActions,
  Button,
  Toolbar,
  Modal
} from "@material-ui/core"
import NavigationIcon from "@material-ui/icons/Navigation"
import AddIcon from "@material-ui/icons/Add"
import { ThemeProvider } from "@material-ui/styles"

const useStyles = makeStyles(theme => ({
  fab: {
    margin: 0,
    position: "fixed",
    right: theme.spacing(2),
    bottom: theme.spacing(2),
    zIndex: theme.zIndex.snackbar
  },
  appBarSpacer: theme.mixins.toolbar as any,
  root: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "spaceAround",
    alignContent: "spaceAround"
  },
  card: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    height: "100%"
  },
  link: {
    margin: theme.spacing(1),
    textDecoration: "none"
  },
  modal: {
    right: theme.spacing(1),
    bottom: theme.spacing(1),
    position: "absolute",
    width: 400,
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: "none"
  }
}))

//TODO: add functionality to delete button
export default function Accounts(_props: RouteComponentProps) {
  const classes = useStyles()
  const addAccount = graphql.useAddAccountMutation({
    refetchQueries: [{ query: graphql.GetAllAccountsDocument }]
  })
  const authenticate = graphql.useAuthenticateMutation()

  const { data, error, loading } = graphql.useGetAllAccountsQuery()
  const [emailValue, setEmailValue] = React.useState("")
  const [mutationError, setError] = React.useState<Error | null>(null)
  const [open, setOpen] = React.useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await addAccount({ variables: { email: emailValue } })
      setEmailValue("")
    } catch (err) {
      setError(err)
    }
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

  const accounts = data!.accounts

  return (
    <div>
      <div className={classes.appBarSpacer} />
      <AppBar>
        <Toolbar>
          <Typography variant="h6">Poodle</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.root}>
        {accounts.map(account => (
          <section key={account.id}>
            <header>
              <Card className={classes.card}>
                <CardHeader title={account.email} />
                <CardActions>
                  {account.loggedIn ? (
                    <Link
                      to={`/accounts/${account.id}/dashboard`}
                      className={classes.link}
                    >
                      <Button>View Conversations</Button>
                      <IconButton aria-label="Delete">
                        <DeleteIcon />
                      </IconButton>
                    </Link>
                  ) : (
                    <Button
                      onClick={() =>
                        authenticate({ variables: { id: account.id } }).catch(
                          setError
                        )
                      }
                    >
                      Log In
                    </Button>
                  )}
                </CardActions>
              </Card>
            </header>
          </section>
        ))}
      </div>
      <Fab
        color="secondary"
        aria-label="Add Acount"
        className={classes.fab}
        onClick={handleOpen}
      >
        <AddIcon />
        <Modal
          aria-labelledby="add account modal"
          aria-describedby="add email account"
          open={open}
          onClose={handleClose}
        >
          <div className={classes.modal}>
            <form onSubmit={onSubmit}>
              <TextField
                label="Email"
                type="text"
                name="email"
                onChange={e => setEmailValue(e.target.value)}
                value={emailValue}
              />
              <Button type="submit">Add Account</Button>
            </form>
          </div>
        </Modal>
      </Fab>
    </div>
  )
}
