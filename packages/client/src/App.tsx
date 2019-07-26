import { globalHistory, RouteComponentProps, Router } from "@reach/router"
import * as React from "react"
import { QueryParamProvider } from "use-query-params"
import Accounts from "./Accounts"
import "./App.css"
import Compose from "./compose/Compose"
import Conversation from "./Conversation"
import Dashboard from "./Dashboard"
import * as graphql from "./generated/graphql"

export default function App() {
  return (
    <QueryParamProvider reachHistory={globalHistory}>
      <Router>
        <Init path="/" />
        <Accounts path="accounts" />
        <Compose path="accounts/:accountId/compose" />
        <Conversation path="accounts/:accountId/conversations/:conversationId" />
        <Dashboard path="accounts/:accountId/dashboard/" />
      </Router>
    </QueryParamProvider>
  )
}

function Init({ navigate }: RouteComponentProps) {
  const { data, error, loading } = graphql.useGetAllAccountsQuery()

  if (loading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Error! {error.message}</div>
  }

  const { accounts } = data!
  const activeAccount = accounts.find(a => a.loggedIn)
  if (activeAccount && navigate) {
    navigate(`/accounts/${activeAccount.id}/dashboard`)
  } else if (navigate) {
    navigate(`/accounts`)
  }

  return <>Poodle</>
}
