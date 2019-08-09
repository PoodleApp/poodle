// Entrypoint for client

import * as colors from "@material-ui/core/colors"
import { createMuiTheme } from "@material-ui/core/styles"
import { ThemeProvider } from "@material-ui/styles"
import {
  createHistory,
  createMemorySource,
  LocationProvider
} from "@reach/router"
import { InMemoryCache } from "apollo-cache-inmemory"
import { ApolloClient } from "apollo-client"
import * as electronImports from "electron"
import { createIpcLink } from "graphql-transport-electron"
import React from "react"
import { ApolloProvider } from "react-apollo"
import ReactDOM from "react-dom"
import "typeface-roboto"
import App from "./App"
import "./index.css"

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

// TODO: signal message updates to frontend via GraphQL subscription instead of
// using Electron IPC directly.
ipcRenderer.on("message_updates", () => {
  if (client.queryManager) {
    client.queryManager.reFetchObservableQueries()
  }
})
ipcRenderer.send("subscribe_to_message_updates")

const theme = createMuiTheme({
  palette: {
    primary: colors.brown,
    secondary: colors.lightBlue
  }
})

// HTML5 history push state does not work in a packaged Electron app when HTML
// is served over the `file://` protocol; so we need to use memory-based routing
// instead. But it would be really inconvenient if we could not reload the page
// and keep routing state in development; so we use the default HTML5 history
// implementation in development.
const history =
  process.env.NODE_ENV === "production"
    ? createHistory(createMemorySource("/"))
    : undefined

ReactDOM.render(
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <LocationProvider history={history}>
        <App />
      </LocationProvider>
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById("root")
)
