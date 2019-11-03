import * as React from "react"
import { Route, Switch, useHistory } from "react-router-dom"
import Accounts from "./Accounts"
import "./App.css"
import Compose from "./compose/Compose"
import Conversation from "./Conversation"
import Dashboard from "./Dashboard"
import * as graphql from "./generated/graphql"

export default function App() {
  return (
    <Switch>
      <Route component={Init} path="/" exact />
      <Route component={Accounts} path="/accounts" exact />
      <Route component={Compose} path="/accounts/:accountId/compose" />
      <Route path="/accounts/:accountId/conversations/:conversationId">
        {({ match }) => (
          <Conversation
            accountId={match!.params.accountId}
            conversationId={match!.params.conversationId}
          />
        )}
      </Route>
      <Route path="/accounts/:accountId/dashboard/">
        {({ match }) => <Dashboard accountId={match!.params.accountId} />}
      </Route>
      <Route path="*">No route matched.</Route>
    </Switch>
  )
}

function Init() {
  const { data, error, loading } = graphql.useGetAllAccountsQuery()
  const history = useHistory()

  if (loading) {
    return <div>Loading...</div>
  }
  if (error) {
    return <div>Error! {error.message}</div>
  }

  const { accounts } = data!
  const activeAccount = accounts.find(a => a.loggedIn)
  if (activeAccount) {
    history.push(`/accounts/${activeAccount.id}/dashboard`)
  } else {
    history.push(`/accounts`)
  }

  return <>Poodle</>
}
