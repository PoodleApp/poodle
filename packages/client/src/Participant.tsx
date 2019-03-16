import * as React from "react"
import * as graphql from "./generated/graphql"

export default function Participant({ name, mailbox, host }: graphql.Address) {
  return name ? (
    <span>
      {name} &lt;{mailbox}@{host}&gt;
    </span>
  ) : (
    <span>
      {mailbox}@{host}
    </span>
  )
}
