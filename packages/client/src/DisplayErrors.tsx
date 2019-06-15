import {
  IconButton,
  makeStyles,
  Snackbar,
  SnackbarContent
} from "@material-ui/core"
import CloseIcon from "@material-ui/icons/Close"
import * as React from "react"
import { MutationResult, QueryResult } from "react-apollo"
import useRequestStates from "./hooks/useRequestStates"

type Props = {
  results: Array<MutationResult | QueryResult>
}

const useStyles = makeStyles(theme => ({
  error: {
    backgroundColor: theme.palette.error.dark
  },
  icon: {
    fontSize: 20
  },
  message: {
    display: "flex",
    alignItems: "center"
  }
}))

export default function DisplayErrors({ results }: Props) {
  const classes = useStyles()
  const { dismissableErrors } = useRequestStates(results)
  if (dismissableErrors.length === 0) {
    return null
  }
  const { error, onDismiss } = dismissableErrors[0]
  return (
    <Snackbar
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      key={error.message}
      onClose={(_event, reason) => {
        if (reason !== "clickaway") {
          onDismiss()
        }
      }}
      open={true}
    >
      <SnackbarContent
        aria-describedby="error-display-snackbar"
        className={classes.error}
        message={
          <span id="error-display-snackbar" className={classes.message}>
            {error.message}
          </span>
        }
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            onClick={onDismiss}
          >
            <CloseIcon className={classes.icon} />
          </IconButton>
        ]}
      />
    </Snackbar>
  )
}
