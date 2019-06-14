import { graphql } from "graphql"
import schema from "../schema"
import db from "../db"
import { Base64Encode } from "base64-stream";
import * as cache from '../cache'
import {testThread} from '../cache/testFixtures'


afterEach(() => {
    jest.clearAllMocks()
    db.prepare("delete from accounts").run()
  })

  let accountId: cache.ID
  let messageId: cache.ID

  beforeEach(()=>{
    const { lastInsertRowid} = db 
        .prepare("insert into accounts (email) values (?)")
        .run("jesse@sitr.us")
    accountId = lastInsertRowid;
    messageId = cache.persistAttributes(
        {accountId, updatedAt: new Date().toISOString() },
        testThread[0].attributes
    )
  })

  it("gets addresses that match some input value", async ()=> {
    db.insert("message_participants", [
        { name: "Alice", host: "test.com", mailbox:"alice", type: "to", message_id: messageId },
        { name: "Bob",  host: "test.com", mailbox:"bob", type: "to", message_id: messageId}
      ])
      const result = await graphql(
        schema,
        `
          query getAllParticipants($value: String!) {
            addresses(inputValue: $value) {
              host
              mailbox
              name
            }
          }
        `,
        null,
        null,
        {value: 'bob'}
      )
      expect(result).toEqual({data : {
          addresses: 
            [{ name: "Bob",  host: "test.com", mailbox:"bob"}]
      }})
  });