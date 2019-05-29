import imap from "imap"
import { ipcMain, IpcRenderer } from "electron"
import { PubSub } from "graphql-subscriptions"

const pubsub = new PubSub()

function topic<T>(
  name: string
): [(event: T) => Promise<void>, AsyncIterable<T>] {
  return [
    value => pubsub.publish(name, value),
    {
      [Symbol.asyncIterator]: () => pubsub.asyncIterator(name)
    }
  ]
}

export const [publishNewMessage, newMessages] = topic<
  imap.ImapMessageAttributes
>("new_message")

export const [publishMessageUpdates, messageUpdates] = topic<null>(
  "message_updates"
)

// TODO: send `messageUpdates` to frontend via GraphQL subscription instead of
// using Electron IPC directly.
ipcMain.on(
  "subscribe_to_message_updates",
  async (event: { sender: IpcRenderer }) => {
    for await (const update of messageUpdates) {
      event.sender.send("message_updates", update)
    }
  }
)
