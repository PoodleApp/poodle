/* eslint-disable default-case */

import { Chip, InputAdornment, makeStyles, TextField } from "@material-ui/core"
import { TextFieldProps } from "@material-ui/core/TextField"
import { parseAddressList, ParsedGroup, ParsedMailbox } from "email-addresses"
import * as React from "react"
import Avatar from "../Avatar"

export type Address = ParsedMailbox

type Props = TextFieldProps & {
  onRecipients: (recipients: Address[]) => void
}

const useStyles = makeStyles(theme => ({
  chip: {
    margin: theme.spacing(0.5, 0.25)
  }
}))

type Action =
  | { type: "add"; recipient: Address }
  | { type: "remove"; recipient: Address }
  | { type: "backspace" }
  | { type: "inputChange"; value: string }
  | { type: "parseAddresses" }

type State = { recipients: Address[]; inputValue: string }

const delimiterPattern = /(?:\s+|\s*,\s*)$/

function reducer(state: State, action: Action): State {
  const { recipients, inputValue } = state
  switch (action.type) {
    case "add":
      return recipients.some(r => email(r) === email(action.recipient))
        ? state
        : { ...state, recipients: [...recipients, action.recipient] }
    case "remove":
      return {
        ...state,
        recipients: recipients.filter(r => email(r) !== email(action.recipient))
      }
    case "backspace":
      return inputValue.length === 0
        ? { ...state, recipients: recipients.slice(0, -1) }
        : state
    case "inputChange":
      const newState = { ...state, inputValue: action.value }
      if (action.value.match(delimiterPattern)) {
        return reducer(newState, { type: "parseAddresses" })
      } else {
        return newState
      }
    case "parseAddresses":
      const parsed = parseAddressList(inputValue.replace(delimiterPattern, ""))
      const addresses = parsed && parsed.filter(isParsedMailbox)
      if (addresses && addresses.length > 0) {
        return addresses.reduce(
          (newState, address) =>
            reducer(newState, { type: "add", recipient: address }),
          { ...state, inputValue: "" }
        )
      } else {
        return state
      }
  }
}

export default function RecipientsInput({ onRecipients, ...rest }: Props) {
  const classes = useStyles()
  const [{ recipients, inputValue }, dispatch] = React.useReducer(reducer, {
    recipients: [],
    inputValue: ""
  })
  const [focused, setFocused] = React.useState(false)

  React.useEffect(() => {
    onRecipients(recipients)
  }, [onRecipients, recipients])

  return (
    <TextField
      {...rest}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {recipients.map(recipient => (
              <Chip
                key={email(recipient)}
                avatar={
                  <Avatar
                    address={{
                      name: recipient.name,
                      mailbox: recipient.local,
                      host: recipient.domain
                    }}
                  />
                }
                tabIndex={-1}
                label={display(recipient)}
                className={classes.chip}
                onDelete={() => dispatch({ type: "remove", recipient })}
              />
            ))}
          </InputAdornment>
        ),
        onChange: event =>
          dispatch({ type: "inputChange", value: event.target.value }),
        onKeyDown: event => {
          if (event.key === "Backspace") {
            dispatch({ type: "backspace" })
          }
        },
        onFocus: () => setFocused(true),
        onBlur: () => {
          setFocused(false)
          dispatch({ type: "parseAddresses" })
        }
      }}
      InputLabelProps={{
        shrink: recipients.length > 0 || inputValue.length > 0 || focused
      }}
      value={inputValue}
    />
  )
}

function display({ name, address }: Address): string {
  return name ? `${name} <${address}>` : address
}

function email({ address }: Address): string {
  return address
}

function isParsedMailbox(a: ParsedMailbox | ParsedGroup): a is ParsedMailbox {
  return "address" in a
}
