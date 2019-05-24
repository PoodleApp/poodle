import { Button, Menu, MenuItem } from "@material-ui/core"
import { ButtonProps } from "@material-ui/core/Button"
import { Link } from "@reach/router"
import * as React from "react"
import * as graphql from "./generated/graphql"

type Props = ButtonProps & { accountId: string }

export default function AccountSwitcher({ accountId, ...rest }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null)
  const { data } = graphql.useGetAllAccountsQuery()
  if (!data || !data.accounts) {
    return null
  }
  console.log("anchorEl", anchorEl)
  const handleClose = () => setAnchorEl(null)
  const { accounts } = data
  const current = accounts.find(account => account.id === accountId)
  const email = current && current.email
  return (
    <>
      <Button
        aria-owns={anchorEl ? "account-switcher-menu" : undefined}
        aria-haspopup="true"
        onClick={event => setAnchorEl(event.currentTarget)}
        {...rest}
      >
        {email || "Accounts"}
      </Button>
      <Menu
        id="account-switcher-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {accounts.map(account => (
          <MenuItem
            key={account.id}
            component={Link}
            to={`/accounts/${account.id}/dashboard`}
            onClick={handleClose}
          >
            {account.email}
          </MenuItem>
        ))}
        <MenuItem component={Link} to="/accounts">
          Manage Accounts
        </MenuItem>
      </Menu>
    </>
  )
}
