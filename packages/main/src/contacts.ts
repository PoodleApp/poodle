import { google, people_v1 } from "googleapis"
import { OauthCredentials } from "./account"
import { getSyncToken, ID, persistContact, persistTokens } from "./cache"
import { build } from "./models/Address"
import { client_id, client_secret } from "./oauth"
import { oauthClient } from "./oauth/google"

export default class ContactsApiClient {
  private people: people_v1.People
  constructor(token: OauthCredentials) {
    const client = oauthClient(client_id, client_secret)
    this.people = google.people({
      version: "v1",
      auth: client
    })

    client.setCredentials(token)
  }

  async getContacts(accountId: ID) {
    const syncToken = getSyncToken(accountId)
    const {
      data: { connections, nextSyncToken }
    } = await this.people.people.connections.list({
      personFields: "names,emailAddresses",
      resourceName: "people/me",
      requestSyncToken: true,
      syncToken
    })

    nextSyncToken && persistTokens(nextSyncToken, accountId)

    return connections
  }

  async downloadContacts(accountId: ID) {
    const connections = await this.getContacts(accountId)
    for (const connection of connections || []) {
      for (const email of connection.emailAddresses || []) {
        const contact = build({
          email: email.value!,
          name:
            connection.names &&
            connection.names[0] &&
            connection.names[0].displayName
        })
        if (contact) {
          persistContact(accountId, contact)
        }
      }
    }
  }
}
