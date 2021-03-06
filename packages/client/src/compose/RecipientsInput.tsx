/* eslint-disable default-case */

import { InputAdornment, makeStyles, TextField, Paper } from "@material-ui/core"
import { TextFieldProps } from "@material-ui/core/TextField"
import { parseAddressList, ParsedGroup, ParsedMailbox } from "email-addresses"
import * as React from "react"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import MenuItem from "@material-ui/core/MenuItem"
import Autosuggest from "react-autosuggest"
import * as graphql from "../generated/graphql"
import clsx from "clsx"
import ParticipantChip from "../ParticipantChip"

export type Address = ParsedMailbox

type Props = TextFieldProps & {
  onRecipients: (recipients: Address[]) => void
}

const useStyles = makeStyles(theme => ({
  container: {
    position: "relative"
  },
  suggestionsContainerOpen: {
    position: "absolute",
    zIndex: theme.zIndex.snackbar,
    marginTop: theme.spacing(1),
    left: 0,
    right: 0
  },
  suggestion: {
    display: "block"
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  },
  fullWidth: {
    width: "100%"
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

export default function RecipientsInput({
  onRecipients,
  fullWidth,
  className,
  ...rest
}: Props) {
  const classes = useStyles()
  const [{ recipients, inputValue }, dispatch] = React.useReducer(reducer, {
    recipients: [],
    inputValue: ""
  })

  const [focused, setFocused] = React.useState(false)

  const skip = inputValue.trim().length < 3

  const { data } = graphql.useGetMatchingAddressesQuery({
    variables: { inputValue },
    skip
  })

  React.useEffect(() => {
    onRecipients(recipients)
  }, [onRecipients, recipients])

  const suggestions = data && data.addresses ? data.addresses : []

  function renderSuggestion(
    suggestion: graphql.Address,
    { query, isHighlighted }: Autosuggest.RenderSuggestionParams
  ) {
    const matches = match(getSuggestionValue(suggestion), query)
    const results = parse(getSuggestionValue(suggestion), matches)

    return (
      <MenuItem selected={isHighlighted} component="div">
        <div>
          {results.map((result, index) => (
            <span
              key={index}
              style={{ fontWeight: result.highlight ? 500 : 400 }}
            >
              {result.text}
            </span>
          ))}
        </div>
      </MenuItem>
    )
  }

  function getSuggestionValue(suggestion: graphql.Address) {
    return suggestion.name
      ? `${suggestion.name} <${suggestion.mailbox}@${suggestion.host}>`
      : `${suggestion.mailbox}@${suggestion.host}`
  }

  const onSuggestionSelected = () => {
    dispatch({ type: "parseAddresses" })
  }

  function renderInputComponent(
    inputProps: Autosuggest.InputProps<typeof suggestions[number]>
  ) {
    return (
      <TextField
        {...(inputProps as any)}
        {...rest}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {recipients.map(recipient => (
                <ParticipantChip
                  key={email(recipient)}
                  address={recipient}
                  onDelete={() => dispatch({ type: "remove", recipient })}
                />
              ))}
            </InputAdornment>
          )
        }}
        InputLabelProps={{
          shrink: recipients.length > 0 || inputValue.length > 0 || focused
        }}
      />
    )
  }

  const autosuggestProps = {
    renderInputComponent,
    suggestions: skip ? [] : suggestions,
    onSuggestionsFetchRequested: noop,
    onSuggestionsClearRequested: noop,
    onSuggestionSelected,
    getSuggestionValue,
    renderSuggestion
  }

  return (
    <Autosuggest
      {...autosuggestProps}
      inputProps={{
        value: inputValue,
        onChange: (_event, { newValue }) =>
          dispatch({ type: "inputChange", value: newValue }),
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
      theme={{
        container: clsx(
          className,
          { [classes.fullWidth]: fullWidth },
          classes.container
        ),
        suggestionsContainerOpen: classes.suggestionsContainerOpen,
        suggestionsList: classes.suggestionsList,
        suggestion: classes.suggestion
      }}
      renderSuggestionsContainer={options => (
        <Paper {...options.containerProps} square>
          {options.children}
        </Paper>
      )}
    />
  )
}

function email({ address }: Address): string {
  return address
}

function isParsedMailbox(a: ParsedMailbox | ParsedGroup): a is ParsedMailbox {
  return "address" in a
}

function noop() {}
