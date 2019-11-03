import PhotoIcon from "@material-ui/icons/Photo"
import { makeStyles } from "@material-ui/styles"
import clsx from "clsx"
import { History } from "history"
import marked from "marked"
import { parseMidUri } from "poodle-common/lib/models/uri"
import * as React from "react"
import { useHistory } from "react-router"
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

  attachment: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  }
}))

type Props = graphql.Content & { accountId: string; className?: string }

export default function DisplayContent({
  accountId,
  type,
  subtype,
  content,
  disposition,
  filename,
  uri,
  className
}: Props) {
  const history = useHistory()
  const classes = useStyles()
  const props: React.HTMLProps<HTMLDivElement> = {
    onClick: event => {
      handleLink(accountId, history, event)
    }
  }
  if (disposition === "attachment") {
    return displayAttachment(filename, subtype, uri, {
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
  uri: string,
  props: object
) {
  const name = filename || `Attachment.${subtype}`
  return (
    <a href={uri}>
      <div {...props}>
        <PhotoIcon />
        {name}
      </div>
    </a>
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
  history: History<unknown>,
  event: React.MouseEvent<HTMLElement, MouseEvent>
) {
  const target = event.target
  if (target instanceof HTMLAnchorElement && target.href) {
    event.preventDefault()

    const parsed = parseMidUri(target.href)
    const messageId = parsed && parsed.messageId
    if (messageId) {
      history.push(
        `/accounts/${accountId}/conversations/${encodeURIComponent(messageId)}`
      )
      return
    }

    shell.openExternal(target.href)
  }
}
