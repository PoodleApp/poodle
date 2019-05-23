// Entrypoint for client

import * as colors from "@material-ui/core/colors"
import { ThemeProvider } from "@material-ui/styles"
import { ApolloClient } from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory"
import * as electronImports from "electron"
import { createIpcLink } from "graphql-transport-electron"
import React from "react"
import { ApolloProvider } from "react-apollo-hooks"
import ReactDOM from "react-dom"
import "typeface-roboto"
import "./index.css"
import App from "./App"
import { createMuiTheme } from "@material-ui/core/styles"

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

const theme = createMuiTheme({
  palette: {
    primary: colors.brown,
    secondary: colors.lightBlue
  }
})

ReactDOM.render(
  <ApolloProvider client={client}>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </ApolloProvider>,
  document.getElementById("root")
)
