import * as React from "react"
import * as graphql from "./generated/graphql"

export default function Participant(address: graphql.Address) {
  return <span>{displayParticipant(address)}</span>
}

export function displayParticipant({ name, mailbox, host }: graphql.Address) {
  return name ? `${name}` : `${mailbox}@${host}`
}
