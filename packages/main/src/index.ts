// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain, protocol } from "electron"
import contextMenu from "electron-context-menu"
import isDev from "electron-is-dev"
import { createIpcExecutor, createSchemaLink } from "graphql-transport-electron"
import schema from "./schema"
import * as cache from "./cache"
import { Readable } from "stream"
// Provide a right-click menu in the UI.
contextMenu()

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL("http://localhost:3000/")

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

function handleContentDownloads() {
  protocol.registerStreamProtocol("mid", async (request, callback) => {
    try {
      const parsed = parseMidUri(request.url)
      const messageId = parsed && parsed.messageId
      const partId = parsed && parsed.partId
      const buffer = cache.getBody(messageId, request.part_id)
      const stream = createStream(buffer)
      callback({
        statusCode: 200,
        headers: {
          "Content-Disposition": "attachment"
        },
        data: stream
      })
    } catch (err) {
      console.error("error serving part content:", err)
      callback({
        statusCode: 500,
        headers: {
          "Content-Disposition": "attachment"
        },
        data: createStream(err.message)
      })
    }
  })
}

function createStream(input: string | Buffer | null) {
  const stream = new Readable()
  stream.push(input)
  return stream
}

function parseMidUri(
  uri: string
): { messageId: string | null; partId: string | null } {
  const midExp = /(mid:|cid:)([^/]+)(?:\/(.+))?$/
  const matches = uri.match(midExp)
  if (matches) {
    const messageId = decodeURIComponent(matches[2])
    const partId = decodeURIComponent(matches[3])
    return { messageId, partId }
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDev) {
    const {
      default: installExtension,
      APOLLO_DEVELOPER_TOOLS,
      REACT_DEVELOPER_TOOLS
    } = require("electron-devtools-installer")
    const IMMUTABLE_JS_OBJECT_FORMATTER = "hgldghadipiblonfkkicmgcbbijnpeog"
    await installExtension(APOLLO_DEVELOPER_TOOLS)
    await installExtension(REACT_DEVELOPER_TOOLS)
    await installExtension(IMMUTABLE_JS_OBJECT_FORMATTER)
  }
  handleContentDownloads()
  createWindow()
})

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
;(function initGraphQL() {
  const link = createSchemaLink({ schema })
  createIpcExecutor({ link, ipc: ipcMain })
})()
