import { app, BrowserWindow, ipcMain, protocol, shell } from "electron"
import contextMenu from "electron-context-menu"
import isDev from "electron-is-dev"
import isFirstRun from "electron-squirrel-startup"
import { createIpcExecutor, createSchemaLink } from "graphql-transport-electron"
import * as path from "path"
import { parseBodyUri } from "poodle-common/lib/models/uri"
import { PassThrough } from "stream"
import * as cache from "./cache"
import { contentType, filename } from "./models/MessagePart"
import schema from "./schema"
import tmp from "tmp"
import * as fs from "fs"

// TODO: We're having an issue checking the TLS certificate for Google's IMAP
// service
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const appUrl = isDev
  ? "http://localhost:3000"
  : "file://" + path.join(__dirname, "..", "public", "index.html")

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
  mainWindow.loadURL(appUrl)

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

ipcMain.on("open_attachment", (event, uri: string) => {
  const { messageId, partId } = getIds(uri)
  const { file } = getDataSpecs(messageId, partId)
  const tempDir = tmp.dirSync()
  const tempFile = `${tempDir.name}/${file}`
  const wstream = fs.createWriteStream(tempFile)
  const rstream = getDataStream(messageId, partId)
  rstream.pipe(wstream)
  rstream.resume()
  shell.openItem(tempFile)
})

function handleContentDownloads() {
  protocol.registerStreamProtocol("body", async (request, callback) => {
    try {
      const { messageId, partId } = getIds(request.url)
      const stream = getDataStream(messageId, partId)
      const { type, file } = getDataSpecs(messageId, partId)
      callback({
        statusCode: 200,
        headers: {
          "content-type": type,
          "content-disposition": `attachment; filename= ${file}`
        },
        data: stream
      })
      stream.resume()
    } catch (err) {
      console.error("error serving part content:", err)
      callback({
        statusCode: 500,
        headers: {
          "content-type": "text/plain; charset=utf8"
        },
        data: createStream(err.message)
      })
    }
  })
}

function getIds(uri: string): { messageId: string; partId: string } {
  const parsed = parseBodyUri(uri)
  if (!parsed) {
    throw new Error(`Unable to parse messageId and partId from URI: ${uri}`)
  }
  return parsed
}

function getDataStream(messageId: string, partId: string): PassThrough {
  const buffer = cache.getBody(messageId, { part_id: partId })
  const stream = createStream(buffer)
  return stream
}

function getDataSpecs(
  messageId: string,
  partId: string
): { type: string; file: string | undefined } {
  const part = cache.getPartByPartId({ messageId, partId })
  const imapPart = part && cache.toImapMessagePart(part)
  if (!imapPart) {
    throw new Error(
      `No data found for messageId: ${messageId} with partID: ${partId}`
    )
  }
  const type = contentType(imapPart)
  const file = filename(imapPart)
  return { type, file }
}

function createStream(input: string | Buffer | null): PassThrough {
  const stream = new PassThrough()
  stream.pause()
  stream.push(input)
  stream.push(null)
  return stream
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (isFirstRun) {
  app.quit()
}

// Provide a right-click menu in the UI.
contextMenu()

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
  createWindow()
  handleContentDownloads()
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
