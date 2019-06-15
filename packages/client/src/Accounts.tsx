import { Link, RouteComponentProps } from "@reach/router"
import * as React from "react"
import * as graphql from "./generated/graphql"

export default function Accounts(_props: RouteComponentProps) {
  const [addAccount] = graphql.useAddAccountMutation({
    refetchQueries: [{ query: graphql.GetAllAccountsDocument }]
  })
  const [authenticate] = graphql.useAuthenticateMutation()
  const { data, error, loading } = graphql.useGetAllAccountsQuery()
  const [emailValue, setEmailValue] = React.useState("")
  const [mutationError, setError] = React.useState<Error | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      await addAccount({ variables: { email: emailValue } })
      setEmailValue("")
    } catch (err) {
      setError(err)
    }
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

  const accounts = data!.accounts

  return (
    <div>
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
                  authenticate({ variables: { id: account.id } }).catch(
                    setError
                  )
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
