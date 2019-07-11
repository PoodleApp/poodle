import { makeStyles } from "@material-ui/styles"
import clsx from "clsx"
import marked from "marked"
import * as React from "react"
import repa from "repa"
import * as graphql from "./generated/graphql"

const { shell } = window.require("electron")

const useStyles = makeStyles(_theme => ({
  body: {
    overflowWrap: "break-word"
  },

  textContent: {
    whiteSpace: "pre-wrap"
  }
}))

type Props = graphql.Content & { className?: string }

export default function DisplayContent({
  type,
  subtype,
  content,
  className
}: Props) {
  const classes = useStyles()
  if (type === "text" && subtype === "html") {
    return displayHtml(content, clsx(className, "html-content", classes.body))
  } else if (type === "text" && subtype === "markdown") {
    return displayMarkdown(
      content,
      clsx(className, "markdown-content", classes.body)
    )
  } else if (type === "text") {
    return displayText(
      content,
      clsx(className, "text-content", clsx(classes.body, classes.textContent))
    )
  } else {
    return displayUnknown(
      { type, subtype, content },
      clsx(className, classes.body)
    )
  }
}

// TODO: remove quoted replies from HTML content
function displayHtml(text: string, className: string) {
  const out = {
    __html: text
  }
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={out}
      onClick={handleExternalLink}
    />
  )
}

function displayText(text: string, className: string) {
  const content = repa(text)
  return (
    <div className={className} onClick={handleExternalLink}>
      {content}
    </div>
  )
}

function displayMarkdown(text: string, className: string) {
  const content = repa(text)
  const out = {
    // TODO: The type definitions for marked do not specify its sync API.
    __html: (marked as any)(content, { sanitized: true })
  }
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={out}
      onClick={handleExternalLink}
    />
  )
}

function displayUnknown(
  {
    type,
    subtype,
    content
  }: { type: string; subtype: string; content: string },
  className: string
) {
  return content ? (
    <div className={className}>
      <p>
        <em>
          [unknown content type: {type}/{subtype}]
        </em>
      </p>
    </div>
  ) : (
    <div className={className}>
      <p>
        <em>[no content]</em>
      </p>
    </div>
  )
}

function handleExternalLink(event: React.MouseEvent<HTMLElement, MouseEvent>) {
  const target = event.target
  if (target instanceof HTMLAnchorElement && target.href) {
    event.preventDefault()
    shell.openExternal(target.href)
  }
}
