// import * as google from './oauth/google'
import { google, people_v1 } from "googleapis"
import { oauthClient } from "./oauth/google"
import { client_id, client_secret } from "./oauth"
import { persistTokens, getSyncToken, persistContacts } from "./cache"
import { ID } from "./cache"
import { OauthCredentials } from "./account"

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
    console.log(google.getSupportedAPIs())
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
    if (connections) {
      persistContacts(accountId, connections)
    }
  }
}
