import imap from "imap"
import { Map } from "immutable"
import { HeaderValue } from "../models/Message"

export const inbox: imap.Box = {
  name: "INBOX",
  newKeywords: true,
  uidvalidity: 9999,
  uidnext: 100000,
  flags: [],
  permFlags: [],
  persistentUIDs: true,
  messages: { total: 1, new: 1, unseen: 1 },
  readOnly: true
}

export const allMail: imap.Box = {
  name: "[Gmail]/All Mail",
  readOnly: true,
  uidvalidity: 123,
  uidnext: 7688,
  flags: [],
  permFlags: [],
  newKeywords: false,
  persistentUIDs: true,
  messages: {
    total: 2,
    new: 0,
    unseen: 0
  }
}

export const testThread: Array<{
  attributes: imap.ImapMessageAttributes
  headers: Array<[string, HeaderValue]>
}> = [
  {
    attributes: {
      struct: [
        {
          id: null,
          partID: "1",
          subtype: "mixed",
          type: "multipart",
          params: {}
        },
        [
          {
            id: null,
            partID: "2",
            type: "alternative",
            params: {}
          },
          [
            {
              description: null,
              disposition: null,
              encoding: "7BIT",
              id: "textFallback",
              partID: "3",
              subtype: "plain",
              type: "text",
              size: 5,
              params: { charset: "UTF-8" }
            }
          ],
          [
            {
              description: null,
              disposition: null,
              encoding: "7BIT",
              id: "htmlContent",
              language: null,
              lines: 1,
              md5: null,
              partID: "4",
              subtype: "html",
              type: "text",
              size: 8,
              params: { charset: "UTF-8" }
            }
          ]
        ],
        [
          {
            disposition: {
              type: "attachment",
              params: { filename: "cat.jpg" }
            },
            encoding: "7BIT",
            id: "attachment",
            partID: "5",
            subtype: "jpeg",
            type: "image",
            size: 100,
            params: {}
          }
        ]
      ],
      envelope: {
        date: new Date("2019-01-31T23:40:04.000Z"),
        subject: "Test thread 2019-02",
        from: [
          { name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }
        ],
        sender: [
          { name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }
        ],
        replyTo: [
          { name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }
        ],
        to: [{ name: "Jesse Hallett", mailbox: "jesse", host: "sitr.us" }],
        cc: null,
        bcc: null,
        inReplyTo: null,
        messageId:
          "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>"
      },
      date: new Date("2019-01-31T23:40:04.000Z"),
      flags: ["\\Answered", "\\Seen"],
      uid: 7467,
      modseq: "3212743",
      "x-gm-labels": ["\\Important", "\\Inbox", "\\Sent"],
      "x-gm-msgid": "1624221160905154372",
      "x-gm-thrid": "1624221157079778491"
    },
    headers: [
      ["mime-version", "1.0"],
      ["date", "2019-01-31T23:40:04.000Z"],
      [
        "message-id",
        "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>"
      ],
      ["subject", "Test thread 2019-02"],
      [
        "from",
        {
          value: [{ address: "hallettj@gmail.com", name: "Jesse Hallett" }],
          html:
            '<span class="mp_address_group"><span class="mp_address_name">Jesse Hallett</span> &lt;<a href="mailto:hallettj@gmail.com" class="mp_address_email">hallettj@gmail.com</a>&gt;</span>',
          text: "Jesse Hallett <hallettj@gmail.com>"
        }
      ],
      [
        "to",
        {
          value: [{ address: "jesse@sitr.us", name: "Jesse Hallett" }],
          html:
            '<span class="mp_address_group"><span class="mp_address_name">Jesse Hallett</span> &lt;<a href="mailto:jesse@sitr.us" class="mp_address_email">jesse@sitr.us</a>&gt;</span>',
          text: "Jesse Hallett <jesse@sitr.us>"
        }
      ],
      ["content-type", { value: "text/plain", params: { charset: "UTF-8" } }]
    ]
  },
  {
    attributes: {
      struct: [
        {
          partID: "1",
          type: "text",
          subtype: "plain",
          params: { charset: "us-ascii" },
          id: null,
          description: null,
          encoding: "7BIT",
          size: 102,
          lines: 3,
          md5: null,
          disposition: null,
          language: null
        }
      ],
      envelope: {
        date: new Date("2019-05-01T22:29:31.000Z"),
        subject: "Re: Test thread 2019-02",
        from: [{ name: "Jesse Hallett", mailbox: "jesse", host: "sitr.us" }],
        sender: [{ name: "Jesse Hallett", mailbox: "jesse", host: "sitr.us" }],
        replyTo: [{ name: "Jesse Hallett", mailbox: "jesse", host: "sitr.us" }],
        to: [{ name: "Jesse Hallett", mailbox: "hallettj", host: "gmail.com" }],
        cc: null,
        bcc: null,
        inReplyTo:
          "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>",
        messageId:
          "<CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA@mail.gmail.com>"
      },
      date: new Date("2019-05-01T22:29:31.000Z"),
      flags: ["\\Seen"],
      uid: 7687,
      modseq: "3212814",
      "x-gm-labels": ["\\Important", "\\Inbox", "\\Sent"],
      "x-gm-msgid": "1632370448644281255",
      "x-gm-thrid": "1624221157079778491"
    },
    headers: [
      ["mime-version", "1.0"],
      ["date", "2019-05-01T22:29:31.000Z"],
      [
        "references",
        "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>"
      ],
      [
        "in-reply-to",
        "<CAGM-pNt++x_o=ZHd_apBYpYntkGWOxF2=Q7H-cGEDUoYUzPOfA@mail.gmail.com>"
      ],
      [
        "message-id",
        "<CAGM-pNvwffuB_LRE4zP7vaO2noOQ0p0qJ8UmSONP3k8ycyo3HA@mail.gmail.com>"
      ],
      ["subject", "Re: Test thread 2019-02"],
      [
        "from",
        {
          value: [{ address: "jesse@sitr.us", name: "Jesse Hallett" }],
          html:
            '<span class="mp_address_group"><span class="mp_address_name">Jesse Hallett</span> &lt;<a href="mailto:jesse@sitr.us" class="mp_address_email">jesse@sitr.us</a>&gt;</span>',
          text: "Jesse Hallett <jesse@sitr.us>"
        }
      ],
      [
        "to",
        {
          value: [{ address: "hallettj@gmail.com", name: "Jesse Hallett" }],
          html:
            '<span class="mp_address_group"><span class="mp_address_name">Jesse Hallett</span> &lt;<a href="mailto:hallettj@gmail.com" class="mp_address_email">hallettj@gmail.com</a>&gt;</span>',
          text: "Jesse Hallett <hallettj@gmail.com>"
        }
      ],
      ["content-type", { value: "text/plain", params: { charset: "us-ascii" } }]
    ]
  }
]

type MessageId = string
type PartID = string

export const testContent: Map<MessageId, Map<PartID, string>> = Map([
  [
    String(testThread[0].attributes.envelope.messageId),
    Map([
      ["3", "This is a test."],
      ["4", "<p>This is a test.</p>"],
      ["5", ""] // Test case of empty body
    ])
  ],
  [
    String(testThread[1].attributes.envelope.messageId),
    Map([["1", "A reply appears."]])
  ]
])
