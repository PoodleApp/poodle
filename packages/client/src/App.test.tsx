import { createHistory, createMemorySource } from "@reach/router"
import * as React from "react"
import App from "./App"
import { mount, updates } from "./testing"
import * as $ from "./testing/fixtures"
import Avatar from "./Avatar"

it("displays a list of conversations", async () => {
  const app = mount(<App />, {
    mocks: [$.getAccountMock],
    route: "accounts/1/dashboard"
  })
  await updates(app)
  expect(app.text()).toMatch("Hello from test")
})

it("archives a conversation from the list view", async () => {
  const resolvers: any = new Proxy(
    {},
    {
      has(obj, prop) {
        console.log("has", obj, prop)
        return false
      },
      get(obj, prop) {
        console.log("get", obj, prop)
        // return accessCount++ > 15 ? undefined : 1
        return resolvers
      },
      ownKeys(...args) {
        console.log("ownKeys", ...args)
        // throw new Error('ownKeys')
        return ["Query", "Mutation", "etc"]
      }
    }
  )

  const app = mount(<App />, {
    mocks: [$.getAccountMock, $.archiveMock, $.getAccountMock],
    resolvers: resolvers as any,
    // resolvers: {
    //   Mutation() {
    //     console.log("Mutation", arguments)
    //   }
    // },
    route: `accounts/${$.account.id}/dashboard`
  })
  await updates(app)
  app
    .find(Avatar)
    .first()
    .simulate("click")
  app.find('button[aria-label="archive"]').simulate("click")
  console.log("^")
  console.log("^")
  console.log("^")
  console.log("^")
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
      $.getAccountMock
    ],
    history
  })
  await updates(app)
  app.find("button[aria-label='archive']").simulate("click")
  await updates(app)
  expect(history.location).toMatchObject({
    pathname: `/accounts/${$.account.id}/dashboard`
  })
})
