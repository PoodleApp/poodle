import { Link, Redirect, RouteComponentProps } from "@reach/router"
import * as React from "react"
import * as graphql from "./generated/graphql"
import DisplayContent from "./DisplayContent"
import Participant from "./Participant"

type Props = RouteComponentProps & {
  accountId?: string
  conversationId?: string
}

export default function Conversation({ accountId, conversationId }: Props) {
  const { data, error, loading } = graphql.useGetConversationQuery({
    variables: { id: conversationId! }
  })

  // TODO: is there a way to guarantee that `accountId` and `conversationId` are available?
  if (!accountId || !conversationId) {
    return <Redirect to="/accounts" />
  }

  if (error) {
    return <div>Error! {error.message}</div>
  }
  if (loading || !data) {
    return <div>Loading...</div>
  }

  if (!data.conversation) {
    return <div>Conversation not found</div>
  }

  const { presentableElements, subject } = data.conversation

  return (
    <section>
      <header>
        <h1>{subject}</h1>
      </header>
      <nav>
        <Link to={`/accounts/${accountId}/dashboard`}>
          &lt;&lt; back to dashboard
        </Link>
      </nav>
      {presentableElements.map(presentable => (
        <Presentable key={presentable.id} {...presentable} />
      ))}
    </section>
  )
}

function Presentable(presentable: graphql.Presentable) {
  return (
    <div>
      <strong>
        <Participant {...presentable.from} />
      </strong>{" "}
      {presentable.date}
      {presentable.contents.map((content, i) => (
        <DisplayContent key={i} {...content} />
      ))}
    </div>
  )
}
