import { ListItem } from "@material-ui/core"
import { createHistory, createMemorySource } from "@reach/router"
import { ReactWrapper } from "enzyme"
import * as React from "react"
import App from "./App"
import Avatar from "./Avatar"
import { mount, updates } from "./testing"
import * as $ from "./testing/fixtures"

it("displays a list of conversations", async () => {
  const app = mount(<App />, {
    mocks: [$.getAccountMock],
    route: "accounts/1/dashboard"
  })
  await updates(app)
  expect(app.find(ListItem)).toIncludeText("Hello from test")
})

it("archives a conversation from the list view", async () => {
  const app = mount(<App />, {
    mocks: [
      $.getAccountMock,
      $.archiveMock,
      {
        ...$.getAccountMock,
        result: { data: { account: { ...$.account, conversations: [] } } }
      }
    ],
    route: `accounts/${$.account.id}/dashboard`
  })
  await updates(app)
  const row = findConversationRow(app, $.conversation)
  expect(row).toIncludeText("Hello from test")
  row.find(Avatar).simulate("click")
  app.find('button[aria-label="archive"]').simulate("click")
  await updates(app, 10)
  expect(findConversationRow(app, $.conversation)).not.toExist()
})

it("archives a conversation from the conversation view", async () => {
  const history = createHistory(
    createMemorySource(
      `accounts/${$.account.id}/conversations/${$.conversation.id}`
    )
  )
  const app = mount(<App />, {
    mocks: [
      $.getConversationMock,
      $.setIsReadMock,
      $.archiveMock,
      {
        ...$.getAccountMock,
        result: { data: { account: { ...$.account, conversations: [] } } }
      }
    ],
    history
  })
  await updates(app)
  app.find("button[aria-label='archive']").simulate("click")
  await updates(app, 10)
  expect(history.location).toMatchObject({
    pathname: `/accounts/${$.account.id}/dashboard`
  })
  expect(findConversationRow(app, $.conversation)).not.toExist()
})

function findConversationRow(
  app: ReactWrapper,
  conversation: { id: string }
): ReactWrapper {
  return app.find("ConversationRow").filterWhere(n => {
    const conv = n.prop("conversation")
    return conv && (conv as any).id === conversation.id
  })
}
