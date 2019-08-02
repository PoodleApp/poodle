import { Tooltip as TTip } from "@material-ui/core"
import React, { ReactElement } from "react"

export default function Tooltip({
  title,
  children
}: {
  title: string
  children: ReactElement
}) {
  return (
    <TTip title={title} enterDelay={500} leaveDelay={200}>
      {children}
    </TTip>
  )
}
