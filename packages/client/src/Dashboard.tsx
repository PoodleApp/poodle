import { Link, Redirect, RouteComponentProps } from "@reach/router"
import * as React from "react"
import * as graphql from "./generated/graphql"
import useSync from "./hooks/useSync"
import Participant from "./Participant"

type Props = RouteComponentProps & { accountId?: string }

export default function Dashboard({ accountId }: Props) {
  const { data, error, loading } = graphql.useGetAccountQuery({
    variables: { accountId: accountId! }
  })
  const { loading: syncLoading, sync } = useSync({
    accountId: accountId!
  })
  const [mutationError, setError] = React.useState<Error | null>(null)

  // TODO: is there a way to guarantee that `accountId` is available?
  if (!accountId) {
    return <Redirect to="/accounts" />
  }

  if (loading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Error! {error.message}</div>
  }
  if (mutationError) {
    return (
      <div>
        Error! <pre>{JSON.stringify(mutationError)}</pre>
        <button onClick={() => setError(null)}>dismiss</button>
      </div>
    )
  }

  const { conversations } = data!.account!

  return (
    <div>
      <nav>
        <button onClick={() => sync().catch(setError)} disabled={syncLoading}>
          Fetch New Messages
        </button>{" "}
        {syncLoading ? "..." : null} <Link to="/accounts">Manage Accounts</Link>
      </nav>
      <Conversations accountId={accountId} conversations={conversations} />
    </div>
  )
}

type Conversation = NonNullable<
  graphql.GetAccountQuery["account"]
>["conversations"][number]

function Conversations({
  accountId,
  conversations
}: {
  accountId: string
  conversations: Conversation[]
}) {
  return (
    <ul>
      {conversations.map(({ id, date, isRead, subject, from }) => (
        <li key={id} className={isRead ? "message" : "unread message"}>
          {date} &mdash;{" "}
          <Link to={`/accounts/${accountId}/conversations/${id}`}>
            {subject}
          </Link>{" "}
          from <Participant {...from} />
        </li>
      ))}
    </ul>
  )
}
