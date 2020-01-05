import { Fab, makeStyles } from "@material-ui/core"
import CreateIcon from "@material-ui/icons/Create"
import * as React from "react"
import { Link } from "react-router-dom"

type Props = { accountId: string }

const useStyles = makeStyles(theme => ({
  fab: {
    margin: 0,
    position: "fixed",
    right: theme.spacing(2),
    bottom: theme.spacing(2),
    zIndex: theme.zIndex.snackbar
  }
}))

export default function ComposeButton({ accountId }: Props) {
  const classes = useStyles()
  return (
    <Fab
      aria-label="Compose a conversation"
      className={classes.fab}
      color="secondary"
      component={Link}
      to={`/accounts/${accountId}/compose`}
    >
      <CreateIcon />
    </Fab>
  )
}
