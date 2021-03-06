// Type definitions for imap v0.8.14
// Project: https://www.npmjs.com/package/imap
// Definitions by: Peter Snider <https://github.com/psnider>
// Definitions: https://github.com/psnider/DefinitelyTyped/imap

/// <reference types="node" />

declare module "imap" {
  export type Callback<T> = ((error: Error) => void) &
    ((error: null, value: T) => void)
  export type Callback0 = (error: Error | null) => void

  namespace Connection {
    // The property names of these interfaces match the documentation (where type names were given).

    export interface Config {
      /** Username for plain-text authentication. */
      user?: string
      /** Password for plain-text authentication. */
      password?: string
      /** Base64-encoded OAuth token for OAuth authentication for servers that support it (See Andris Reinman's xoauth.js module to help generate this string). */
      xoauth?: string
      /** Base64-encoded OAuth2 token for The SASL XOAUTH2 Mechanism for servers that support it (See Andris Reinman's xoauth2 module to help generate this string). */
      xoauth2?: string
      /** Hostname or IP address of the IMAP server. Default: "localhost" */
      host?: string
      /** Port number of the IMAP server. Default: 143 */
      port?: number
      /** Perform implicit TLS connection? Default: false */
      tls?: boolean
      /** Options object to pass to tls.connect() Default: (none) */
      tlsOptions?: Object
      /** Set to 'always' to always attempt connection upgrades via STARTTLS, 'required' only if upgrading is required, or 'never' to never attempt upgrading. Default: 'never' */
      autotls?: string
      /** Number of milliseconds to wait for a connection to be established. Default: 10000 */
      connTimeout?: number
      /** Number of milliseconds to wait to be authenticated after a connection has been established. Default: 5000 */
      authTimeout?: number
      /** Configures the keepalive mechanism. Set to true to enable keepalive with defaults or set to object to enable and configure keepalive behavior: Default: true */
      keepalive?: any /* boolean|KeepAlive */
      /** If set, the function will be called with one argument, a string containing some debug info Default: (no debug output) */
      debug?: Function
    }

    export interface KeepAlive {
      /** This is the interval (in milliseconds) at which NOOPs are sent and the interval at which idleInterval is checked. Default: 10000 */
      interval?: number
      /** This is the interval (in milliseconds) at which an IDLE command (for servers that support IDLE) is re-sent. Default: 300000 (5 mins) */
      idleInterval?: number
      /** Set to true to force use of NOOP keepalive on servers also support IDLE. Default: false */
      forceNoop?: boolean
    }

    export interface Box {
      /** The name of this mailbox. */
      name: string
      /** True if this mailbox was opened in read-only mode. (Only available with openBox() calls) */
      readOnly?: boolean
      /** True if new keywords can be added to messages in this mailbox. */
      newKeywords: boolean
      /** A 32-bit number that can be used to determine if UIDs in this mailbox have changed since the last time this mailbox was opened. */
      uidvalidity: number
      /** The uid that will be assigned to the next message that arrives at this mailbox. */
      uidnext: number
      /** array - A list of system-defined flags applicable for this mailbox. Flags in this list but not in permFlags may be stored for the current session only. Additional server implementation-specific flags may also be available. */
      flags: string[]
      /** A list of flags that can be permanently added/removed to/from messages in this mailbox. */
      permFlags: string[]
      /** Whether or not this mailbox has persistent UIDs. This should almost always be true for modern mailboxes and should only be false for legacy mail stores where supporting persistent UIDs was not technically feasible. */
      persistentUIDs: boolean
      /** Contains various message counts for this mailbox: */
      messages: {
        /** Total number of messages in this mailbox. */
        total: number
        /** Number of messages in this mailbox having the Recent flag (this IMAP session is the first to see these messages). */
        new: number
        /** (Only available with status() calls) Number of messages in this mailbox not having the Seen flag (marked as not having been read). */
        unseen: number
      }
    }

    // One of:
    // - a single message identifier
    // - a message identifier range (e.g. '2504:2507' or '*' or '2504:*')
    // - an array of message identifiers
    // - an array of message identifier ranges.
    export type MessageSource = string | string[] | number[]

    export type UID = string

    export interface ImapMessageBodyInfo {
      /** The specifier for this body (e.g. 'TEXT', 'HEADER.FIELDS (TO FROM SUBJECT)', etc). */
      which: string
      /** The size of this body in bytes. */
      size: number
    }

    export type MessageId = string // unique message ID in angle brackets

    export interface ImapMessageAttributes {
      /** A 32-bit ID that uniquely identifies this message within its mailbox. */
      uid: number
      /** A list of flags currently set on this message. */
      flags: string[]
      /** The internal server date for the message. */
      date: Date
      modseq: string
      /** The message's body structure (only set if requested with fetch()). */
      struct?: ImapMessageStruct
      envelope: {
        date: Date
        subject: string | null
        from: (Address | AddressGroup)[] | null
        sender: (Address | AddressGroup)[] | null
        replyTo: (Address | AddressGroup)[] | null
        to: (Address | AddressGroup)[] | null
        cc: (Address | AddressGroup)[] | null
        bcc: (Address | AddressGroup)[] | null
        inReplyTo: MessageId | null
        messageId: MessageId
      }
      /** The RFC822 message size (only set if requested with fetch()). */
      size?: number
      "x-gm-labels"?: string[]
      "x-gm-thrid"?: string
      "x-gm-msgid"?: string
    }

    export interface Address {
      name?: string | null // e.g., person's full name
      mailbox: string // username portion of email address
      host: string // host portion of email address
    }

    export interface AddressGroup {
      name: string
      addresses: Address[]
    }

    export interface Disposition {
      params?: Record<string, string> | null
      type: string
    }

    /*
     * If TypeScript supported this sort of recursive type, this type would
     * properly be:
     *
     *     type ImapMessageStruct = [ImapMessagePart, ...ImapMessageStruct]
     *
     * Since Flow does not support that, we must use a type definition that is
     * a little more general than it should be.
     */
    export interface ImapMessageStruct
      extends Array<ImapMessagePart | ImapMessageStruct> {}

    export interface ImapMessagePart {
      partID?: string
      type: string // eg, 'text'
      subtype?: string // eg, 'plain'
      params: Record<string, string> // eg, boundary, charset
      encoding?: string
      id?: string | null
      description?: string | null
      disposition?: Disposition | null
      language?: string | null
      location?: string
      md5?: string | null
      size?: number // in bytes, only set if requested in `fetch()`
      lines?: number
    }

    /** Given in a 'message' event from ImapFetch */
    export interface ImapMessage extends NodeJS.EventEmitter {
      on(event: string, listener: Function): this
      on(
        event: "body",
        listener: (
          stream: NodeJS.ReadableStream,
          info: ImapMessageBodyInfo
        ) => void
      ): this
      on(
        event: "attributes",
        listener: (attrs: ImapMessageAttributes) => void
      ): this
      on(event: "end", listener: () => void): this
    }

    export interface FetchOptions {
      /** Mark message(s) as read when fetched. Default: false */
      markSeen?: boolean
      /** Fetch the message structure. Default: false */
      struct?: boolean
      /** Fetch the message envelope. Default: false */
      envelope?: boolean
      /** Fetch the RFC822 size. Default: false */
      size?: boolean
      /** Fetch modifiers defined by IMAP extensions. Default: (none) */
      modifiers?: Object
      /** A string or Array of strings containing the body part section to fetch. Default: (none) Example sections: */
      bodies?: string | string[]
    }

    /** Returned from fetch() */
    export interface ImapFetch extends NodeJS.EventEmitter {
      on(event: string, listener: Function): this
      on(
        event: "message",
        listener: (message: ImapMessage, seqno: number) => void
      ): this
      on(event: "error", listener: (error: Error) => void): this
      once(event: string, listener: Function): this
      once(event: "error", listener: (error: Error) => void): this
    }

    export interface Folder {
      /** mailbox attributes. An attribute of 'NOSELECT' indicates the mailbox cannot be opened */
      attribs: string[]
      /** hierarchy delimiter for accessing this mailbox's direct children. */
      delimiter: string
      /** an object containing another structure similar in format to this top level, otherwise null if no children */
      children: MailBoxes
      /** pointer to parent mailbox, null if at the top level */
      parent: Folder
    }

    export interface MailBoxes {
      [name: string]: Folder
    }

    export interface AppendOptions {
      /** The name of the mailbox to append the message to. Default: the currently open mailbox */
      mailbox?: string
      /** A single flag (e.g. 'Seen') or an array of flags (e.g. ['Seen', 'Flagged']) to append to the message. Default: (no flags) */
      flags?: any /* string|string[] */
      /** What to use for message arrival date/time. Default: (current date/time) */
      date?: Date
    }

    export interface MessageFunctions {
      /** Searches the currently open mailbox for messages using given criteria. criteria is a list describing what you want to find. For criteria types that require arguments, use an array instead of just the string criteria type name (e.g. ['FROM', 'foo@bar.com']). Prefix criteria types with an "!" to negate.

        The following message flags are valid types that do not have arguments:

        ALL:            void;    // All messages.
        ANSWERED:       void;    // Messages with the Answered flag set.
        DELETED:        void;    // Messages with the Deleted flag set.
        DRAFT:          void;    // Messages with the Draft flag set.
        FLAGGED:        void;    // Messages with the Flagged flag set.
        NEW:            void;    // Messages that have the Recent flag set but not the Seen flag.
        SEEN:           void;    // Messages that have the Seen flag set.
        RECENT:         void;    // Messages that have the Recent flag set.
        OLD:            void;    // Messages that do not have the Recent flag set. This is functionally equivalent to "!RECENT" (as opposed to "!NEW").
        UNANSWERED:     void;    // Messages that do not have the Answered flag set.
        UNDELETED:      void;    // Messages that do not have the Deleted flag set.
        UNDRAFT:        void;    // Messages that do not have the Draft flag set.
        UNFLAGGED:      void;    // Messages that do not have the Flagged flag set.
        UNSEEN:         void;    // Messages that do not have the Seen flag set.

        The following are valid types that require string value(s):

        BCC:            any;    // Messages that contain the specified string in the BCC field.
        CC:             any;    // Messages that contain the specified string in the CC field.
        FROM:           any;    // Messages that contain the specified string in the FROM field.
        SUBJECT:        any;    // Messages that contain the specified string in the SUBJECT field.
        TO:             any;    // Messages that contain the specified string in the TO field.
        BODY:           any;    // Messages that contain the specified string in the message body.
        TEXT:           any;    // Messages that contain the specified string in the header OR the message body.
        KEYWORD:        any;    // Messages with the specified keyword set.
        HEADER:         any;    // Requires two string values, with the first being the header name and the second being the value to search for. If this second string is empty, all messages that contain the given header name will be returned.

        The following are valid types that require a string parseable by JavaScripts Date object OR a Date instance:

        BEFORE:         any;    // Messages whose internal date (disregarding time and timezone) is earlier than the specified date.
        ON:             any;    // Messages whose internal date (disregarding time and timezone) is within the specified date.
        SINCE:          any;    // Messages whose internal date (disregarding time and timezone) is within or later than the specified date.
        SENTBEFORE:     any;    // Messages whose Date header (disregarding time and timezone) is earlier than the specified date.
        SENTON:         any;    // Messages whose Date header (disregarding time and timezone) is within the specified date.
        SENTSINCE:      any;    // Messages whose Date header (disregarding time and timezone) is within or later than the specified date.

        The following are valid types that require one Integer value:

        LARGER:         number;    // Messages with a size larger than the specified number of bytes.
        SMALLER:        number;    // Messages with a size smaller than the specified number of bytes.

        The following are valid criterion that require one or more Integer values:

        UID:            any;    // Messages with UIDs corresponding to the specified UID set. Ranges are permitted (e.g. '2504:2507' or '*' or '2504:*').
        */
      search(criteria: any[], callback: Callback<UID[]>): void
      /** Fetches message(s) in the currently open mailbox; source can be a single message identifier, a message identifier range (e.g. '2504:2507' or '*' or '2504:*'), an array of message identifiers, or an array of message identifier ranges. */
      fetch(source: Connection.MessageSource, options: FetchOptions): ImapFetch
      /** Copies message(s) in the currently open mailbox to another mailbox. */
      copy(
        source: Connection.MessageSource,
        mailboxName: string,
        callback: Callback0
      ): void
      /** Moves message(s) in the currently open mailbox to another mailbox. Note: The message(s) in the destination mailbox will have a new message UID. */
      move(
        source: Connection.MessageSource,
        mailboxName: string,
        callback: Callback0
      ): void
      /** Adds flag(s) to message(s). */
      addFlags(
        source: Connection.MessageSource,
        flags: any,
        callback: Callback0
      ): void
      /** Removes flag(s) from message(s). */
      delFlags(
        source: Connection.MessageSource,
        flags: any,
        callback: Callback0
      ): void
      /** Sets the flag(s) for message(s). */
      setFlags(
        source: Connection.MessageSource,
        flags: any,
        callback: Callback0
      ): void
      /** Adds keyword(s) to message(s). keywords is either a single keyword or an array of keywords. */
      addKeywords(
        source: Connection.MessageSource,
        keywords: any /* string|string[] */,
        callback: Callback0
      ): void
      /** Removes keyword(s) from message(s). keywords is either a single keyword or an array of keywords. */
      delKeywords(
        source: Connection.MessageSource,
        keywords: any /* string|string[] */,
        callback: Callback0
      ): void
      /** Sets keyword(s) for message(s). keywords is either a single keyword or an array of keywords. */
      setKeywords(
        source: Connection.MessageSource,
        keywords: any /* string|string[] */,
        callback: Callback0
      ): void
      /** Checks if the server supports the specified capability. */
      serverSupports(capability: string): boolean
    }
  }

  class Connection extends NodeJS.EventEmitter
    implements Connection.MessageFunctions {
    /** @constructor */
    constructor(config: Connection.Config)

    // from MessageFunctions
    /** Searches the currently open mailbox for messages using given criteria. criteria is a list describing what you want to find. For criteria types that require arguments, use an array instead of just the string criteria type name (e.g. ['FROM', 'foo@bar.com']). Prefix criteria types with an "!" to negate. */
    search(criteria: any[], callback: Callback<Connection.UID[]>): void
    /** Fetches message(s) in the currently open mailbox. */
    fetch(
      source: Connection.MessageSource,
      options: Connection.FetchOptions
    ): Connection.ImapFetch
    /** Copies message(s) in the currently open mailbox to another mailbox. */
    copy(
      source: Connection.MessageSource,
      mailboxName: string,
      callback: Callback0
    ): void
    /** Moves message(s) in the currently open mailbox to another mailbox. Note: The message(s) in the destination mailbox will have a new message UID. */
    move(
      source: Connection.MessageSource,
      mailboxName: string,
      callback: Callback0
    ): void
    /** Adds flag(s) to message(s). */
    addFlags(
      source: Connection.MessageSource,
      flags: any,
      callback: Callback0
    ): void
    /** Removes flag(s) from message(s). */
    delFlags(
      source: Connection.MessageSource,
      flags: any,
      callback: Callback0
    ): void
    /** Sets the flag(s) for message(s). */
    setFlags(
      source: Connection.MessageSource,
      flags: any,
      callback: Callback0
    ): void
    /** Adds keyword(s) to message(s). keywords is either a single keyword or an array of keywords. */
    addKeywords(
      source: Connection.MessageSource,
      keywords: any /* string|string[] */,
      callback: Callback0
    ): void
    /** Removes keyword(s) from message(s). keywords is either a single keyword or an array of keywords. */
    delKeywords(
      source: Connection.MessageSource,
      keywords: any /* string|string[] */,
      callback: Callback0
    ): void
    /** Sets keyword(s) for message(s). keywords is either a single keyword or an array of keywords. */
    setKeywords(
      source: Connection.MessageSource,
      keywords: any /* string|string[] */,
      callback: Callback0
    ): void
    /** Checks if the server supports the specified capability. */
    serverSupports(capability: string): boolean

    /** Parses a raw header and returns an object keyed on header fields and the values are Arrays of header field values. Set disableAutoDecode to true to disable automatic decoding of MIME encoded-words that may exist in header field values. */
    static parseHeader(
      rawHeader: string,
      disableAutoDecode?: boolean
    ): { [index: string]: string[] }

    /** The current state of the connection (e.g. 'disconnected', 'connected', 'authenticated'). */
    state: string
    /** The (top-level) mailbox hierarchy delimiter. If the server does not support mailbox hierarchies and only a flat list, this value will be falsey. */
    delimiter: string
    /** Contains information about each namespace type (if supported by the server) with the following properties: */
    namespaces: {
      /** Mailboxes that belong to the logged in user. */
      personal: any[]
      /** Mailboxes that belong to other users that the logged in user has access to. */
      other: any[]
      /** Mailboxes that are accessible by any logged in user. */
      shared: any[]
    }
    /**
        seq exposes the search() ... serverSupports() set of commands, but returns sequence number(s) instead of UIDs.
        */
    seq: Connection.MessageFunctions
    /** Attempts to connect and authenticate with the IMAP server. */
    connect(): void
    /** Closes the connection to the server after all requests in the queue have been sent. */
    end(): void
    /** Immediately destroys the connection to the server. */
    destroy(): void
    /** Opens a specific mailbox that exists on the server. mailboxName should include any necessary prefix/path. modifiers is used by IMAP extensions. */
    openBox(mailboxName: string, callback: Callback<Connection.Box>): void
    openBox(
      mailboxName: string,
      openReadOnly: boolean,
      callback: Callback<Connection.Box>
    ): void
    /** Closes the currently open mailbox. If autoExpunge is true, any messages marked as Deleted in the currently open mailbox will be removed if the mailbox was NOT opened in read-only mode. If autoExpunge is false, you disconnect, or you open another mailbox, messages marked as Deleted will NOT be removed from the currently open mailbox. */
    closeBox(callback: Callback0): void
    closeBox(autoExpunge: boolean, callback: Callback0): void
    /** Creates a new mailbox on the server. mailboxName should include any necessary prefix/path. */
    addBox(mailboxName: string, callback: Callback0): void
    /** Removes a specific mailbox that exists on the server. mailboxName should including any necessary prefix/path. */
    delBox(mailboxName: string, callback: Callback0): void
    /** Renames a specific mailbox that exists on the server. Both oldMailboxName and newMailboxName should include any necessary prefix/path. Note: Renaming the 'INBOX' mailbox will instead cause all messages in 'INBOX' to be moved to the new mailbox. */
    renameBox(
      oldMailboxName: string,
      newMailboxName: string,
      callback: Callback<Connection.Box>
    ): void
    /** Subscribes to a specific mailbox that exists on the server. mailboxName should include any necessary prefix/path. */
    subscribeBox(mailboxName: string, callback: Callback0): void
    /** Unsubscribes from a specific mailbox that exists on the server. mailboxName should include any necessary prefix/path. */
    unsubscribeBox(mailboxName: string, callback: Callback0): void
    /** Fetches information about a mailbox other than the one currently open. Note: There is no guarantee that this will be a fast operation on the server. Also, do not call this on the currently open mailbox. */
    status(mailboxName: string, callback: Callback<Connection.Box>): void
    /** Obtains the full list of mailboxes. If nsPrefix is not specified, the main personal namespace is used. */
    getBoxes(callback: Callback<Connection.MailBoxes>): void
    getBoxes(nsPrefix: string, callback: Callback<Connection.MailBoxes>): void
    /** Obtains the full list of subscribed mailboxes. If nsPrefix is not specified, the main personal namespace is used. */
    getSubscribedBoxes(callback: Callback<Connection.MailBoxes>): void
    getSubscribedBoxes(
      nsPrefix: string,
      callback: Callback<Connection.MailBoxes>
    ): void
    /** Permanently removes all messages flagged as Deleted in the currently open mailbox. If the server supports the 'UIDPLUS' capability, uids can be supplied to only remove messages that both have their uid in uids and have the \Deleted flag set. Note: At least on Gmail, performing this operation with any currently open mailbox that is not the Spam or Trash mailbox will merely archive any messages marked as Deleted (by moving them to the 'All Mail' mailbox). */
    expunge(callback: Callback0): void
    expunge(uids: Connection.MessageSource, callback: Callback0): void
    /** Appends a message to selected mailbox. msgData is a string or Buffer containing an RFC-822 compatible MIME message. Valid options properties are: */
    append(msgData: any, callback: Callback0): void
    append(
      msgData: any,
      options: Connection.AppendOptions,
      callback: Callback0
    ): void

    // Gmail-specific methods
    setLabels(
      source: Connection.MessageSource,
      labels: unknown,
      callback: (error: Error | null) => void
    ): void
    addLabels(
      source: Connection.MessageSource,
      labels: unknown,
      callback: (error: Error | null) => void
    ): void
    delLabels(
      source: Connection.MessageSource,
      labels: unknown,
      callback: (error: Error | null) => void
    ): void
  }

  export default Connection
}
