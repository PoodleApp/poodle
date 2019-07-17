import { ListItemText } from "@material-ui/core"
import * as React from "react"
import Avatar from "./Avatar"
import Dashboard from "./Dashboard"
import { mount, updates } from "./testing"
import * as $ from "./testing/fixtures"

it("stars conversations", async () => {
  const app = mount(<Dashboard accountId={$.account.id} />, {
    mocks: [
      $.getAccountMock,
      $.flagMock,
      {
        ...$.getAccountMock,
        result: {
          data: {
            account: {
              ...$.account,
              conversations: [{ ...$.conversation, isStarred: true }]
            }
          }
        }
      }
    ]
  })

  await updates(app)
  app.find(Avatar).simulate("click")
  app.find('button[aria-label="star"]').simulate("click")
  await updates(app, 10)

  console.log(app.find("SelectedActionsBar").props())

  expect(app.find(ListItemText)).toIncludeText("★ ")
})
