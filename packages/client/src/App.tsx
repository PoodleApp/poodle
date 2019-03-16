import { RouteComponentProps, Router } from "@reach/router"
import * as React from "react"
import "./App.css"
import * as graphql from "./generated/graphql"
import Accounts from "./Accounts"
import Conversation from "./Conversation"
import Dashboard from "./Dashboard"

export default function App() {
  return (
    <Router>
      <Init path="/" />
      <Accounts path="accounts" />
      <Conversation path="accounts/:accountId/conversations/:conversationId" />
      <Dashboard path="accounts/:accountId/dashboard/" />
    </Router>
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
