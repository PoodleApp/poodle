import * as React from "react"
import SearchIcon from "@material-ui/icons/Search"
import Dashboard from "./Dashboard"
import { mount, updates } from "./testing"
import * as $ from "./testing/fixtures"

it("searches", async () => {
  const app = mount(<Dashboard accountId={$.account.id} />, {
    mocks: [$.getAccountMock, $.searchMock({ query: "search query" })]
  })
  await updates(app)
  app.find(SearchIcon).simulate("click")
  app
    .find("SearchBar")
    .find("input")
    .simulate("change", { target: { value: "search query" } })
  app
    .find("SearchBar")
    .find("form")
    .simulate("submit")
  await updates(app)
  expect(app.find("Conversations").prop("conversations")).toMatchObject([
    {
      id: $.conversation2.id,
      subject: $.conversation2.subject
    }
  ])
})
