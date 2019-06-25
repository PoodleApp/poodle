import { Chip, makeStyles } from "@material-ui/core"
import { ChipProps } from "@material-ui/core/Chip"
import { ParsedMailbox } from "email-addresses"
import * as React from "react"
import Avatar from "./Avatar"
import { Address } from "./generated/graphql"

const useStyles = makeStyles(theme => ({
  chip: {
    margin: theme.spacing(0.5, 0.25)
  }
}))

type Props = ChipProps & {
  recipient: Address | ParsedMailbox
}

export default function ParticipantChip({ recipient, ...rest }: Props) {
  const classes = useStyles()
  return (
    <Chip
      {...rest}
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
    />
  )
}

function display({ name, address }: ParsedMailbox): string {
  return name ? `${name} <${address}>` : address
}

function email({ address }: ParsedMailbox): string {
  return address
}
