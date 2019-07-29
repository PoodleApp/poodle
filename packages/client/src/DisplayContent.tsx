import { makeStyles } from "@material-ui/styles"
import PhotoIcon from "@material-ui/icons/Photo"
import { Location } from "@reach/router"
import clsx from "clsx"
import marked from "marked"
import { parseMidUri } from "poodle-common/lib/models/uri"
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
  },

  attachment: {}
}))

type Props = graphql.Content & { accountId: string; className?: string }

export default function DisplayContent({
  accountId,
  type,
  subtype,
  content,
  disposition,
  filename,
  name,
  className
}: Props) {
  const classes = useStyles()
  return (
    <Location>
      {({ navigate }) => {
        const props: React.DetailedHTMLProps<
          React.HTMLProps<HTMLDivElement>,
          HTMLDivElement
        > = {
          onClick: event => {
            handleLink(accountId, navigate, event)
          }
        }
        if (disposition === "attachment") {
          return displayAttachment(filename, subtype, {
            ...props,
            className: clsx(className, "attachment-content", classes.attachment)
          })
        }
        if (content && type === "text" && subtype === "html") {
          return displayHtml(content, {
            ...props,
            className: clsx(className, "html-content", classes.body)
          })
        } else if (content && type === "text" && subtype === "markdown") {
          return displayMarkdown(content, {
            ...props,
            className: clsx(className, "markdown-content", classes.body)
          })
        } else if (content && type === "text") {
          return displayText(content, {
            ...props,
            className: clsx(
              className,
              "text-content",
              clsx(classes.body, classes.textContent)
            )
          })
        } else {
          return displayUnknown(
            { type, subtype, content, disposition },
            { className: clsx(className, classes.body) }
          )
        }
      }}
    </Location>
  )
}

// TODO: remove quoted replies from HTML content
function displayHtml(text: string, props: object) {
  const out = {
    __html: text
  }
  return <div {...props} dangerouslySetInnerHTML={out} />
}

function displayText(text: string, props: object) {
  const content = repa(text)
  return <div {...props}>{content}</div>
}

function displayMarkdown(text: string, props: object) {
  const content = repa(text)
  const out = {
    // TODO: The type definitions for marked do not specify its sync API.
    __html: (marked as any)(content, { sanitized: true })
  }
  return <div {...props} dangerouslySetInnerHTML={out} />
}

function displayAttachment(
  filename: string | null | undefined,
  subtype: string,
  props: object
) {
  const name = filename ? (
    <div {...props}>{filename}</div>
  ) : (
    <div {...props}>[Attachment.{subtype}}</div>
  )
  return (
    <div>
      <PhotoIcon />
      {name}
    </div>
  )
}

function displayUnknown(
  {
    type,
    subtype,
    content,
    disposition
  }: {
    type: string
    subtype: string
    content: string | null | undefined
    disposition: string
  },
  props: object
) {
  return content ? (
    <div {...props}>
      <p>
        <em>
          [unknown content type: {disposition}/{type}/{subtype}]
        </em>
      </p>
    </div>
  ) : (
    <div {...props}>
      <p>
        <em>[no content]</em>
      </p>
    </div>
  )
}

function handleLink(
  accountId: string,
  navigate: (location: string) => unknown,
  event: React.MouseEvent<HTMLElement, MouseEvent>
) {
  const target = event.target
  if (target instanceof HTMLAnchorElement && target.href) {
    event.preventDefault()

    const parsed = parseMidUri(target.href)
    const messageId = parsed && parsed.messageId
    if (messageId) {
      navigate(
        `/accounts/${accountId}/conversations/${encodeURIComponent(messageId)}`
      )
      return
    }

    shell.openExternal(target.href)
  }
}
