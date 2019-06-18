/* eslint-disable default-case */

import {
  Chip,
  InputAdornment,
  makeStyles,
  TextField,
  Paper
} from "@material-ui/core"
import { TextFieldProps } from "@material-ui/core/TextField"
import { parseAddressList, ParsedGroup, ParsedMailbox } from "email-addresses"
import * as React from "react"
import Avatar from "../Avatar"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import MenuItem from "@material-ui/core/MenuItem"
import Autosuggest from "react-autosuggest"
import * as graphql from "../generated/graphql"

export type Address = ParsedMailbox

type Props = TextFieldProps & {
  onRecipients: (recipients: Address[]) => void
}

const useStyles = makeStyles(theme => ({
  chip: {
    margin: theme.spacing(0.5, 0.25)
  },
  container: {
    position: "relative"
  },
  suggestionsContainerOpen: {
    position: "absolute",
    zIndex: 1,
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
  }
}))

type Action =
  | { type: "add"; recipient: Address }
  | { type: "remove"; recipient: Address }
  | { type: "backspace" }
  | { type: "inputChange"; value: string }
  | { type: "parseAddresses" }

type State = { recipients: Address[]; inputValue: string }

interface Suggestion {
  label: string
}

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
  const [stateSuggestions, setSuggestions] = React.useState<graphql.Address[]>(
    []
  )

  const [focused, setFocused] = React.useState(false)

  const { data } = graphql.useGetAllAddressesQuery({
    variables: { inputValue }
  })
  let addresses = data && data.addresses

  const suggestions = addresses || []

  function renderSuggestion(
    suggestion: graphql.Address,
    { query, isHighlighted }: Autosuggest.RenderSuggestionParams
  ) {
    const matches = match(getSuggestionValue(suggestion), query)
    const results = parse(getSuggestionValue(suggestion), matches)

    return (
      <MenuItem selected={isHighlighted} component="div">
        <div>
          {results.map(result => (
            <span
              key={result.text}
              style={{ fontWeight: result.highlight ? 500 : 400 }}
            >
              {result.text}
            </span>
          ))}
        </div>
      </MenuItem>
    )
  }

  function getSuggestions() {
    return suggestions
  }

  function getSuggestionValue(suggestion: graphql.Address) {
    return suggestion.name
      ? `${suggestion.name} <${suggestion.mailbox}@${suggestion.host}>`
      : `${suggestion.mailbox}@${suggestion.host}`
  }

  const handleSuggestionsFetchRequested = () => {
    setSuggestions(getSuggestions())
  }

  const handleSuggestionsClearRequested = () => {
    setSuggestions([])
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
    suggestions: stateSuggestions,
    onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
    onSuggestionsClearRequested: handleSuggestionsClearRequested,
    onSuggestionSelected,
    getSuggestionValue,
    renderSuggestion
  }

  React.useEffect(() => {
    onRecipients(recipients)
  }, [onRecipients, recipients])

  return (
    <Autosuggest
      {...autosuggestProps}
      inputProps={{
        id: "react-autosuggest-simple",
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
        container: classes.container,
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

function display({ name, address }: Address): string {
  return name ? `${name} <${address}>` : address
}

function email({ address }: Address): string {
  return address
}

function isParsedMailbox(a: ParsedMailbox | ParsedGroup): a is ParsedMailbox {
  return "address" in a
}
