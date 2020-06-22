import { idFromHeaderValue, midUri } from "poodle-common/lib/models/uri"
import Prism from "prismjs"
import React, { useMemo, useCallback } from "react"
import { createEditor, Node, Range, Text, Transforms, NodeEntry } from "slate"
import { withHistory } from "slate-history"
import { Editable, RenderElementProps, Slate, withReact } from "slate-react"
import styled, { css } from "styled-components"
import DisplayErrors from "../DisplayErrors"
import * as graphql from "../generated/graphql"
import * as schema from "./schema"
/* import { Suggestions, useSuggestionsPlugin } from "./suggestions" */

const capture = /(\S+(?:\s+\S+){0,4}\s*)$/

export default function Editor({
  className,
  onChange,
  placeholder,
  value
}: {
  className?: string
  onChange: (value: Node[]) => void
  placeholder?: string
  value: Node[]
}) {
  /* const { plugin, query: conversationQuery } = useSuggestionsPlugin({ capture }) */
  /* const convSearchResult = graphql.useSearchCachedConversationsQuery({ */
  /*   skip: !conversationQuery, */
  /*   variables: { query: conversationQuery!, specificityThreshold: 2 } */
  /* }) */
  /* const suggestions = */
  /*   conversationQuery && */
  /*   convSearchResult.data && */
  /*   convSearchResult.data.conversations */
  /*     ? convSearchResult.data.conversations */
  /*         .filter(({ conversation }) => Boolean(conversation.subject)) */
  /*         .map(({ conversation, query }) => ({ */
  /*           id: conversation.id, */
  /*           title: conversation.subject!, */
  /*           conversation, */
  /*           query */
  /*         })) */
  /*     : [] */
  /* const plugins = useMemo(() => [plugin], [plugin]) */
  const renderLeaf = useCallback(props => <Leaf {...props} />, [])
  const editor = useMemo(() => {
    const e = withHistory(withReact(createEditor()))
    /* Object.assign(e, schema.editorExtenions) */
    return e
  }, [])

  /* function insertMention({ conversation, query }: typeof suggestions[number]) { */
  /*   const { messageId, subject } = conversation */
  /*   if (!messageId || !subject) { */
  /*     return */
  /*   } */
  /*   Transforms.delete(editor, { */
  /*     distance: query.length, */
  /*     unit: "character", */
  /*     reverse: true */
  /*   }) */
  /*   Transforms.insertNodes( */
  /*     editor, */
  /*     schema.conversationLink({ */
  /*       messageId: idFromHeaderValue(messageId), */
  /*       subject */
  /*     }) */
  /*   ) */
  /* } */

  return (
    <>
      <Slate
        editor={editor}
        value={value}
        onChange={onChange}

        // plugins={plugins}
        // spellCheck
        // schema={schema}
      >
        <Editable
          className={className}
          decorate={decorate}
          placeholder={placeholder}
          renderLeaf={renderLeaf}
          // renderElement={renderElement}
        />
      </Slate>
      {/* <Suggestions */}
      {/*   anchor=".mention-context" */}
      {/*   items={suggestions} */}
      {/*   onSelect={insertMention} */}
      {/* /> */}
      {/* <DisplayErrors results={[convSearchResult]} /> */}
    </>
  )
}

const titleStyle = css`
  display: inline-block;
  font-weight: bold;
  font-size: 2rem;
  margin: 2rem 0 1rem 0;
`

const listStyle = css`
  padding-left: 1rem;
  font-size: 2rem;
  line-height: 1rem;
`

const hrStyle = css`
  display: block;
  text-align: center;
  border-bottom: 0.2rem solid #ddd;
`

const blockquoteStyle = css`
  display: inline-block;
  border-left: 0.2rem solid #ddd;
  padding-left: 1rem;
  color: #aaa;
  font-style: italic;
`

const codeStyle = css`
  font-family: monospace;
  background-color: #eee;
  padding: 0.3rem;
`

const LeafSpan = styled.span<{ tokenType?: string }>`
  font-weight: ${props => props.tokenType === "bold" && "bold"};
  font-style: ${props => props.tokenType === "italic" && "italic"};
  text-decoration: ${props => props.tokenType === "underline" && "underline"};
  ${props => props.tokenType === "title" && titleStyle}
  ${props => props.tokenType === "list" && listStyle}
  ${props => props.tokenType === "hr" && hrStyle}
  ${props => props.tokenType === "blockquote" && blockquoteStyle}
  ${props => props.tokenType === "code" && codeStyle}
`

function Leaf({
  attributes,
  children,
  leaf
}: {
  attributes: React.HTMLAttributes<HTMLSpanElement>
  children: React.ReactNode
  leaf: Text
}) {
  return (
    <LeafSpan {...attributes} tokenType={leaf.tokenType as string | undefined}>
      {children}
    </LeafSpan>
  )
}

function decorate([node, path]: NodeEntry<Node>): Range[] {
  const ranges: Range[] = []

  if (!Text.isText(node)) {
    return ranges
  }

  const getLength = (token: Prism.Token | string): number => {
    if (typeof token === "string") {
      return token.length
    } else if (typeof token.content === "string") {
      return token.content.length
    } else if (token.content instanceof Prism.Token) {
      return getLength(token.content)
    } else {
      return token.content.reduce((l, t) => l + getLength(t), 0)
    }
  }

  const tokens = Prism.tokenize(node.text, Prism.languages.markdown)
  let start = 0

  for (const token of tokens) {
    const length = getLength(token)
    const end = start + length

    if (typeof token !== "string") {
      ranges.push({
        tokenType: token.type,
        anchor: { path, offset: start },
        focus: { path, offset: end }
      })
    }

    start = end
  }

  return ranges
}

/* function renderElement(props: RenderElementProps) { */
/*   switch (props.element.type) { */
/*     case schema.ElementType.ConversationLink: */
/*       return <ConversationLinkElement {...props} /> */
/*     case schema.ElementType.Paragraph: */
/*       return <ParagraphElement {...props} /> */
/*     default: */
/*       return <DefaultElement {...props} /> */
/*   } */
/* } */

/* function ConversationLinkElement({ */
/*   attributes, */
/*   element, */
/*   children */
/* }: RenderElementProps) { */
/*   const { messageId } = element */
/*   const href = messageId ? midUri(messageId) : "" */
/*   return ( */
/*     <a href={href} {...attributes}> */
/*       {children} */
/*     </a> */
/*   ) */
/* } */

/* function ParagraphElement({ attributes, children }: RenderElementProps) { */
/*   return <p {...attributes}>{children}</p> */
/* } */

/* function DefaultElement({ attributes, children }: RenderElementProps) { */
/*   return <div {...attributes}>{children}</div> */
/* } */
