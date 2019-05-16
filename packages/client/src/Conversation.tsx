import { Link, Redirect, RouteComponentProps, navigate } from "@reach/router"
import * as React from "react"
import * as graphql from "./generated/graphql"
import useArchive from "./hooks/useArchive"
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
  const archive = useArchive({
    accountId: accountId!,
    conversationId: conversationId!
  })
  const setIsRead = graphql.useSetIsReadMutation({
    variables: { conversationId: conversationId!, isRead: true }
  })
  React.useEffect(() => {
    if (data && !error && !loading) {
      setIsRead()
    }
  }, [data, error, loading, setIsRead])

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

  const { labels, presentableElements, subject } = data.conversation

  const onArchive = async () => {
    await archive()
    navigate(`/accounts/${accountId}/dashboard`)
  }

  return (
    <section>
      <header>
        <h1>{subject}</h1>
        {labels
          ? labels.map(label => (
              <span className="label" key={label}>
                {label}
              </span>
            ))
          : null}
      </header>
      <nav>
        <Link to={`/accounts/${accountId}/dashboard`}>
          &lt;&lt; back to dashboard
        </Link>{" "}
        <button onClick={onArchive}>Archive</button>
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
