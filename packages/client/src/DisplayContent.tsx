import marked from "marked"
import * as React from "react"
import repa from "repa"
import * as graphql from "./generated/graphql"

const { shell } = window.require("electron")

// TODO: temporary
const spacing = { desktopKeylineIncrement: 30 }

const styles = {
  body: {
    overflowWrap: "break-word",
    padding: `${spacing.desktopKeylineIncrement * 1}px`,
    paddingTop: 0
  },

  textContent: {
    whiteSpace: "pre-wrap"
  }
}

type Props = graphql.Content & { style?: object }

export default function DisplayContent({
  type,
  subtype,
  content,
  style
}: Props) {
  if (type === "text" && subtype === "html") {
    return displayHtml(content, style)
  } else if (type === "text" && subtype === "markdown") {
    return displayMarkdown(content, style)
  } else if (type === "text") {
    return displayText(content, style)
  } else {
    return displayUnknown({ type, subtype, content }, style)
  }
}

// TODO: remove quoted replies from HTML content
function displayHtml(text: string, style?: Object) {
  const out = {
    __html: text
  }
  return (
    <div
      className="html-content"
      dangerouslySetInnerHTML={out}
      onClick={handleExternalLink}
      style={style || styles.body}
    />
  )
}

function displayText(text: string, style?: Object) {
  const content = repa(text)
  return (
    <div
      className="text-content"
      onClick={handleExternalLink}
      style={style || { ...styles.body, ...styles.textContent }}
    >
      {content}
    </div>
  )
}

function displayMarkdown(text: string, style?: Object) {
  const content = repa(text)
  const out = {
    // TODO: The type definitions for marked do not specify its sync API.
    __html: (marked as any)(content, { sanitized: true })
  }
  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={out}
      onClick={handleExternalLink}
      style={style || styles.body}
    />
  )
}

function displayUnknown(
  {
    type,
    subtype,
    content
  }: { type: string; subtype: string; content: string },
  style?: Object
) {
  return content ? (
    <div style={style || styles.body}>
      <p>
        <em>
          [unknown content type: {type}/{subtype}]
        </em>
      </p>
    </div>
  ) : (
    <div style={style || styles.body}>
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
