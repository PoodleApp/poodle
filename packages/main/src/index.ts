// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain } from "electron"
import contextMenu from "electron-context-menu"
import { createIpcExecutor, createSchemaLink } from "graphql-transport-electron"
import notifier from "node-notifier"
import * as path from "path"
import { formatAddressList } from "./models/Address"
import { newMessages } from "./pubsub"
import schema from "./schema"

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

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  createWindow()
  for await (const message of newMessages) {
    if (message.flags.includes("\\Important") && Notification.isSupported()) {
      notifier.notify({
        title: message.envelope.subject || "[no subject]",
        message: formatAddressList(message.envelope.from || []),
        icon: path.join(__dirname, "..", "..", "..", "assets", "poodle.png")
      })
    }
  }
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
