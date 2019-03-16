// Entrypoint for client

import { ApolloClient } from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory"
import * as electronImports from "electron"
import { createIpcLink } from "graphql-transport-electron"
import React from "react"
import { ApolloProvider } from "react-apollo-hooks"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"

// Workaround to escape from Webpack's import rewriting
declare global {
  interface Window {
    // eslint-disable-next-line no-undef
    require(mod: "electron"): typeof electronImports
  }
}
const { ipcRenderer } = window.require("electron")

const link = createIpcLink({ ipc: ipcRenderer })
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root")
)
