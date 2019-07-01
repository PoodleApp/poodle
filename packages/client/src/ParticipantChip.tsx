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
  address: Address | ParsedMailbox
  nameOnly?: boolean
}

export default function ParticipantChip({
  address,
  nameOnly = false,
  ...rest
}: Props) {
  const classes = useStyles()
  const addr = asAddress(address)
  return (
    <Chip
      {...rest}
      avatar={<Avatar address={addr} />}
      tabIndex={-1}
      label={display(addr, nameOnly)}
      className={classes.chip}
    />
  )
}

function asAddress(addr: Address | ParsedMailbox): Address {
  if ("mailbox" in addr) {
    return addr
  } else {
    return { name: addr.name, mailbox: addr.local, host: addr.domain }
  }
}

function display({ name, mailbox, host }: Address, nameOnly?: boolean): string {
  const email = `${mailbox}@${host}`
  if (nameOnly) {
    return name || email
  } else {
    return name ? `${name} <${email}>` : email
  }
}
