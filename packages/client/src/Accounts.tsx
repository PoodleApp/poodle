import { Link, RouteComponentProps } from "@reach/router"
import * as React from "react"
import DisplayErrors from "./DisplayErrors"
import * as graphql from "./generated/graphql"

export default function Accounts(_props: RouteComponentProps) {
  const [addAccount, addAccountResult] = graphql.useAddAccountMutation({
    refetchQueries: [{ query: graphql.GetAllAccountsDocument }]
  })
  const [authenticate, authenticateResult] = graphql.useAuthenticateMutation()
  const accountsResult = graphql.useGetAllAccountsQuery()
  const [emailValue, setEmailValue] = React.useState("")

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await addAccount({ variables: { email: emailValue } })
      setEmailValue("")
    } catch (err) {}
  }

  if (accountsResult.loading) {
    return <div>Loading...</div>
  }
  if (accountsResult.error) {
    return <div>Error! {accountsResult.error.message}</div>
  }

  const accounts = accountsResult.data!.accounts

  return (
    <div>
      <DisplayErrors
        results={[addAccountResult, authenticateResult, accountsResult]}
      />
      {accounts.map(account => (
        <section key={account.id}>
          <header>
            <h3>{account.email}</h3>
            {account.loggedIn ? (
              <Link to={`/accounts/${account.id}/dashboard`}>
                View Conversations
              </Link>
            ) : (
              <button
                onClick={() =>
                  authenticate({ variables: { id: account.id } }).catch(noop)
                }
              >
                Log In
              </button>
            )}
          </header>
        </section>
      ))}
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="email"
          onChange={e => setEmailValue(e.target.value)}
          value={emailValue}
        />
        <button type="submit">Add Account</button>
      </form>
    </div>
  )
}

function noop() {}
