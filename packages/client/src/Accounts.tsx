import { Link, RouteComponentProps } from "@reach/router"
import * as React from "react"
import DisplayErrors from "./DisplayErrors"
import * as graphql from "./generated/graphql"
import { makeStyles } from "@material-ui/core/styles"
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
import AddIcon from "@material-ui/icons/Add"
import CloseIcon from "@material-ui/icons/Close"

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
    flexWrap: "wrap"
  },

  card: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    alignItems: "stretch",
    height: "20vh",
    width: "55.5vh"
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
  },

  addAcountButton: {
    top: theme.spacing(2)
  }
}))

export default function Accounts(_props: RouteComponentProps) {
  const classes = useStyles()
  const [addAccount, addAccountResult] = graphql.useAddAccountMutation({
    refetchQueries: [{ query: graphql.GetAllAccountsDocument }]
  })
  const [authenticate, authenticateResult] = graphql.useAuthenticateMutation()
  const deleteAccount = graphql.useDeleteAccountMutation()
  const accountsResult = graphql.useGetAllAccountsQuery()
  const [emailValue, setEmailValue] = React.useState("")
  const [open, setOpen] = React.useState(false)

  const handleClick = () => {
    open ? setOpen(false) : setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await addAccount({ variables: { email: emailValue } })
      setEmailValue("")
    } catch (err) {}
  }

  if (accountsResult.loading) {
    return <div>Loading...</div>
  }
  if (accountsResult.error) {
    return <div>Error! {accountsResult.error.message}</div>
  }

  const accounts = accountsResult.data!.accounts

  return (
    <div>
      <DisplayErrors
        results={[addAccountResult, authenticateResult, accountsResult]}
      />
      <div className={classes.appBarSpacer} />
      <AppBar>
        <Toolbar>
          <Typography variant="h6">Poodle</Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.root}>
        {accounts.map(account => (
          <section key={account.id}>
            <Card className={classes.card}>
              <CardHeader title={account.email} />
              <CardActions>
                {account.loggedIn ? (
                  <>
                    <Button
                      component={Link}
                      to={`/accounts/${account.id}/dashboard`}
                    >
                      View Conversations
                    </Button>
                    <IconButton
                      aria-label="Delete"
                      onClick={() =>
                        deleteAccount({
                          variables: { id: account.id }
                        })
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                ) : (
                  <Button
                    onClick={() =>
                      authenticate({ variables: { id: account.id } })
                    }
                  >
                    Log In
                  </Button>
                )}
              </CardActions>
            </Card>
          </section>
        ))}
      </div>
      <Fab
        color="secondary"
        aria-label="Add Acount"
        className={classes.fab}
        onClick={handleClick}
      >
        {open ? <CloseIcon /> : <AddIcon />}
      </Fab>
      <Modal
        aria-describedby="add-email-form"
        open={open}
        onClose={handleClose}
      >
        <div className={classes.modal}>
          <form onSubmit={onSubmit} id="add-email-form">
            <TextField
              label="Email"
              type="text"
              name="email"
              onChange={e => setEmailValue(e.target.value)}
              value={emailValue}
            />
            <Button type="submit" className={classes.addAcountButton}>
              Add Account
            </Button>
          </form>
        </div>
      </Modal>
    </div>
  )
}

function noop() {}
