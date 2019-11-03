import { ListItem } from "@material-ui/core"
import { ReactWrapper } from "enzyme"
import { createMemoryHistory } from "history"
import * as React from "react"
import App from "./App"
import Avatar from "./Avatar"
import { mount, updates } from "./testing"
import * as $ from "./testing/fixtures"

it("displays a list of conversations", async () => {
  const app = mount(<App />, {
    mocks: [$.getAccountMock],
    route: "/accounts/1/dashboard"
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
    route: `/accounts/${$.account.id}/dashboard`
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
  const history = createMemoryHistory({
    initialEntries: [
      `/accounts/${$.account.id}/conversations/${$.conversation.id}`
    ]
  })
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

it("opens another conversation when a link is clicked", async () => {
  const history = createMemoryHistory({
    initialEntries: [
      `/accounts/${$.account.id}/conversations/${$.conversation.id}`
    ]
  })
  const getConversationMock = {
    ...$.getConversationMock,
    result: {
      data: {
        conversation: {
          ...$.conversation,
          presentableElements: [
            $.conversation.presentableElements[0],
            {
              ...$.conversation.presentableElements[1],
              contents: [
                {
                  ...$.conversation.presentableElements[1].contents[0],
                  type: "text",
                  subtype: "html",
                  content: `
                    Link to <a
                      href="mid:f0c0ffc0-ca85-489e-9661-8e65041fc592%40sitr.us"
                      data-messageid="f0c0ffc0-ca85-489e-9661-8e65041fc592@sitr.us"
                      data-subject="another conversation"
                    >another conversation</a>
                  `
                }
              ]
            }
          ]
        }
      }
    }
  }
  const app = mount(<App />, {
    history,
    mocks: [getConversationMock, $.setIsReadMock]
  })
  await updates(app)
  const content = app.find("DisplayContent .html-content")

  // Enzyme does not actually render content set with `dangerouslySetInnerHTML`,
  // so we have to provide fake information about a click event on the link that
  // would have been rendered.
  const link = document.createElement("a")
  link.setAttribute(
    "href",
    "mid:f0c0ffc0-ca85-489e-9661-8e65041fc592%40sitr.us"
  )
  content.simulate("click", { target: link })

  await updates(app)
  expect(history.location).toMatchObject({
    pathname: `/accounts/${$.account.id}/conversations/f0c0ffc0-ca85-489e-9661-8e65041fc592%40sitr.us`
  })
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
