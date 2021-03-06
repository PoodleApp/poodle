/* eslint-disable */
import { DocumentNode } from "graphql"
import * as ReactApolloHooks from "@apollo/react-hooks"
export type Maybe<T> = T | null
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
}

export type Account = {
  __typename?: "Account"
  id: Scalars["ID"]
  email: Scalars["String"]
  loggedIn: Scalars["Boolean"]
  conversations: Array<Conversation>
  messages: Array<Message>
  search: Search
}

export type AccountConversationsArgs = {
  label?: Maybe<Scalars["String"]>
}

export type AccountSearchArgs = {
  query: Scalars["String"]
}

export type AccountMutations = {
  __typename?: "AccountMutations"
  create: Account
  authenticate: Account
  delete: Scalars["Boolean"]
  sync: Account
}

export type AccountMutationsCreateArgs = {
  email: Scalars["String"]
}

export type AccountMutationsAuthenticateArgs = {
  id: Scalars["ID"]
}

export type AccountMutationsDeleteArgs = {
  id: Scalars["ID"]
}

export type AccountMutationsSyncArgs = {
  id: Scalars["ID"]
}

export type Address = {
  __typename?: "Address"
  host: Scalars["String"]
  mailbox: Scalars["String"]
  name?: Maybe<Scalars["String"]>
}

export type AddressInput = {
  host: Scalars["String"]
  mailbox: Scalars["String"]
  name?: Maybe<Scalars["String"]>
}

export type Content = {
  __typename?: "Content"
  resource: PartSpec
  revision: PartSpec
  disposition: Disposition
  filename?: Maybe<Scalars["String"]>
  name?: Maybe<Scalars["String"]>
  type: Scalars["String"]
  subtype: Scalars["String"]
  content?: Maybe<Scalars["String"]>
  /** uri is used internally to retrieve the content for the part */
  uri: Scalars["String"]
}

export type ContentInput = {
  type: Scalars["String"]
  subtype: Scalars["String"]
  content: Scalars["String"]
}

export type Conversation = {
  __typename?: "Conversation"
  id: Scalars["ID"]
  date: Scalars["String"]
  from: Address
  labels?: Maybe<Array<Scalars["String"]>>
  /** RFC 2822 Message ID of the first message in the conversation, if available. */
  messageId?: Maybe<Scalars["String"]>
  presentableElements: Array<Presentable>
  isRead: Scalars["Boolean"]
  isStarred: Scalars["Boolean"]
  replyRecipients: Participants
  snippet?: Maybe<Scalars["String"]>
  subject?: Maybe<Scalars["String"]>
}

export type ConversationReplyRecipientsArgs = {
  fromAccountId: Scalars["ID"]
}

export type ConversationMutations = {
  __typename?: "ConversationMutations"
  archive: Conversation
  flag: Array<Conversation>
  flagPresentable: Conversation
  edit: Conversation
  reply: Conversation
  setIsRead: Conversation
  sendMessage: Conversation
}

export type ConversationMutationsArchiveArgs = {
  id: Scalars["ID"]
}

export type ConversationMutationsFlagArgs = {
  ids: Array<Scalars["ID"]>
  isFlagged: Scalars["Boolean"]
}

export type ConversationMutationsFlagPresentableArgs = {
  id: Scalars["ID"]
  conversationId: Scalars["ID"]
  isFlagged: Scalars["Boolean"]
}

export type ConversationMutationsEditArgs = {
  accountId: Scalars["ID"]
  conversationId: Scalars["ID"]
  resource: PartSpecInput
  revision: PartSpecInput
  content: ContentInput
}

export type ConversationMutationsReplyArgs = {
  accountId: Scalars["ID"]
  id: Scalars["ID"]
  content: ContentInput
}

export type ConversationMutationsSetIsReadArgs = {
  id: Scalars["ID"]
  isRead: Scalars["Boolean"]
}

export type ConversationMutationsSendMessageArgs = {
  accountId: Scalars["ID"]
  message: MessageInput
}

export type ConversationSearchResult = {
  __typename?: "ConversationSearchResult"
  conversation: Conversation
  query: Scalars["String"]
}

export enum Disposition {
  Inline = "inline",
  Attachment = "attachment"
}

export type Message = {
  __typename?: "Message"
  id: Scalars["ID"]
  date: Scalars["String"]
  messageId: Scalars["ID"]
  subject?: Maybe<Scalars["String"]>
  from: Array<Address>
}

export type MessageInput = {
  subject?: Maybe<Scalars["String"]>
  to: Array<AddressInput>
  content: ContentInput
}

export type Mutation = {
  __typename?: "Mutation"
  accounts: AccountMutations
  conversations: ConversationMutations
}

export type Participants = {
  __typename?: "Participants"
  from?: Maybe<Array<Address>>
  to: Array<Address>
  cc: Array<Address>
  replyTo?: Maybe<Array<Address>>
}

export type PartSpec = {
  __typename?: "PartSpec"
  messageId: Scalars["String"]
  contentId?: Maybe<Scalars["String"]>
}

export type PartSpecInput = {
  messageId: Scalars["String"]
  contentId?: Maybe<Scalars["String"]>
}

export type Presentable = {
  __typename?: "Presentable"
  id: Scalars["ID"]
  isRead: Scalars["Boolean"]
  isStarred: Scalars["Boolean"]
  contents: Array<Content>
  date: Scalars["String"]
  from: Address
  editedAt?: Maybe<Scalars["String"]>
  editedBy?: Maybe<Address>
}

export type Query = {
  __typename?: "Query"
  account?: Maybe<Account>
  accounts: Array<Account>
  addresses: Array<Address>
  conversation?: Maybe<Conversation>
  conversations: Array<ConversationSearchResult>
}

export type QueryAccountArgs = {
  id: Scalars["ID"]
}

export type QueryAddressesArgs = {
  inputValue: Scalars["String"]
}

export type QueryConversationArgs = {
  id: Scalars["ID"]
}

export type QueryConversationsArgs = {
  query: Scalars["String"]
  specificityThreshold?: Maybe<Scalars["Int"]>
}

export type Search = {
  __typename?: "Search"
  id: Scalars["ID"]
  conversations: Array<Conversation>
  loading: Scalars["Boolean"]
  query: Scalars["String"]
}
export type GetAllAccountsQueryVariables = {}

export type GetAllAccountsQuery = { __typename?: "Query" } & {
  accounts: Array<{ __typename?: "Account" } & AccountFieldsFragment>
}

export type GetAccountQueryVariables = {
  accountId: Scalars["ID"]
}

export type GetAccountQuery = { __typename?: "Query" } & {
  account: Maybe<
    { __typename?: "Account" } & {
      conversations: Array<
        { __typename?: "Conversation" } & ConversationFieldsForListViewFragment
      >
    } & AccountFieldsFragment
  >
}

export type DeleteAccountMutationVariables = {
  id: Scalars["ID"]
}

export type DeleteAccountMutation = { __typename?: "Mutation" } & {
  accounts: { __typename?: "AccountMutations" } & Pick<
    AccountMutations,
    "delete"
  >
}

export type AddAccountMutationVariables = {
  email: Scalars["String"]
}

export type AddAccountMutation = { __typename?: "Mutation" } & {
  accounts: { __typename?: "AccountMutations" } & {
    create: { __typename?: "Account" } & AccountFieldsFragment
  }
}

export type AuthenticateMutationVariables = {
  id: Scalars["ID"]
}

export type AuthenticateMutation = { __typename?: "Mutation" } & {
  accounts: { __typename?: "AccountMutations" } & {
    authenticate: { __typename?: "Account" } & AccountFieldsFragment
  }
}

export type GetConversationQueryVariables = {
  id: Scalars["ID"]
  accountId: Scalars["ID"]
}

export type GetConversationQuery = { __typename?: "Query" } & {
  conversation: Maybe<
    {
      __typename?: "Conversation"
    } & ConversationFieldsForConversationViewFragment
  >
}

export type SearchConversationsQueryVariables = {
  accountId: Scalars["ID"]
  query: Scalars["String"]
}

export type SearchConversationsQuery = { __typename?: "Query" } & {
  account: Maybe<
    { __typename?: "Account" } & Pick<Account, "id"> & {
        search: { __typename?: "Search" } & Pick<
          Search,
          "id" | "loading" | "query"
        > & {
            conversations: Array<
              {
                __typename?: "Conversation"
              } & ConversationFieldsForListViewFragment
            >
          }
      }
  >
}

export type SearchCachedConversationsQueryVariables = {
  query: Scalars["String"]
  specificityThreshold?: Maybe<Scalars["Int"]>
}

export type SearchCachedConversationsQuery = { __typename?: "Query" } & {
  conversations: Array<
    { __typename?: "ConversationSearchResult" } & Pick<
      ConversationSearchResult,
      "query"
    > & {
        conversation: { __typename?: "Conversation" } & Pick<
          Conversation,
          "id" | "messageId" | "subject"
        >
      }
  >
}

export type GetMatchingAddressesQueryVariables = {
  inputValue: Scalars["String"]
}

export type GetMatchingAddressesQuery = { __typename?: "Query" } & {
  addresses: Array<
    { __typename?: "Address" } & Pick<Address, "host" | "mailbox" | "name">
  >
}

export type SyncMutationVariables = {
  accountId: Scalars["ID"]
}

export type SyncMutation = { __typename?: "Mutation" } & {
  accounts: { __typename?: "AccountMutations" } & {
    sync: { __typename?: "Account" } & {
      conversations: Array<
        { __typename?: "Conversation" } & ConversationFieldsForListViewFragment
      >
    } & AccountFieldsFragment
  }
}

export type SetIsReadMutationVariables = {
  conversationId: Scalars["ID"]
  isRead: Scalars["Boolean"]
}

export type SetIsReadMutation = { __typename?: "Mutation" } & {
  conversations: { __typename?: "ConversationMutations" } & {
    setIsRead: { __typename?: "Conversation" } & Pick<
      Conversation,
      "id" | "isRead"
    >
  }
}

export type ArchiveMutationVariables = {
  conversationId: Scalars["ID"]
}

export type ArchiveMutation = { __typename?: "Mutation" } & {
  conversations: { __typename?: "ConversationMutations" } & {
    archive: {
      __typename?: "Conversation"
    } & ConversationFieldsForListViewFragment
  }
}

export type FlagMutationVariables = {
  conversationIDs: Array<Scalars["ID"]>
  isFlagged: Scalars["Boolean"]
}

export type FlagMutation = { __typename?: "Mutation" } & {
  conversations: { __typename?: "ConversationMutations" } & {
    flag: Array<
      { __typename?: "Conversation" } & Pick<
        Conversation,
        "id" | "isStarred"
      > & {
          presentableElements: Array<
            { __typename?: "Presentable" } & Pick<
              Presentable,
              "id" | "isStarred"
            >
          >
        }
    >
  }
}

export type FlagPresentableMutationVariables = {
  presentableId: Scalars["ID"]
  conversationId: Scalars["ID"]
  isFlagged: Scalars["Boolean"]
}

export type FlagPresentableMutation = { __typename?: "Mutation" } & {
  conversations: { __typename?: "ConversationMutations" } & {
    flagPresentable: { __typename?: "Conversation" } & Pick<
      Conversation,
      "id" | "isStarred"
    > & {
        presentableElements: Array<
          { __typename?: "Presentable" } & Pick<Presentable, "id" | "isStarred">
        >
      }
  }
}

export type SendMessageMutationVariables = {
  accountId: Scalars["ID"]
  message: MessageInput
}

export type SendMessageMutation = { __typename?: "Mutation" } & {
  conversations: { __typename?: "ConversationMutations" } & {
    sendMessage: {
      __typename?: "Conversation"
    } & ConversationFieldsForConversationViewFragment
  }
}

export type EditMutationVariables = {
  accountId: Scalars["ID"]
  conversationId: Scalars["ID"]
  resource: PartSpecInput
  revision: PartSpecInput
  content: ContentInput
}

export type EditMutation = { __typename?: "Mutation" } & {
  conversations: { __typename?: "ConversationMutations" } & {
    edit: {
      __typename?: "Conversation"
    } & ConversationFieldsForConversationViewFragment
  }
}

export type ReplyMutationVariables = {
  accountId: Scalars["ID"]
  conversationId: Scalars["ID"]
  content: ContentInput
}

export type ReplyMutation = { __typename?: "Mutation" } & {
  conversations: { __typename?: "ConversationMutations" } & {
    reply: {
      __typename?: "Conversation"
    } & ConversationFieldsForConversationViewFragment
  }
}

export type AccountFieldsFragment = { __typename?: "Account" } & Pick<
  Account,
  "id" | "email" | "loggedIn"
>

export type ConversationFieldsForListViewFragment = {
  __typename?: "Conversation"
} & Pick<
  Conversation,
  "id" | "date" | "isRead" | "isStarred" | "labels" | "snippet" | "subject"
> & {
    from: { __typename?: "Address" } & Pick<
      Address,
      "host" | "mailbox" | "name"
    >
  }

export type ConversationFieldsForConversationViewFragment = {
  __typename?: "Conversation"
} & Pick<
  Conversation,
  "id" | "date" | "isRead" | "isStarred" | "labels" | "snippet" | "subject"
> & {
    from: { __typename?: "Address" } & Pick<
      Address,
      "host" | "mailbox" | "name"
    >
    presentableElements: Array<
      { __typename?: "Presentable" } & Pick<
        Presentable,
        "id" | "isRead" | "isStarred" | "date" | "editedAt"
      > & {
          contents: Array<
            { __typename?: "Content" } & Pick<
              Content,
              | "type"
              | "subtype"
              | "content"
              | "disposition"
              | "filename"
              | "name"
              | "uri"
            > & {
                revision: { __typename?: "PartSpec" } & Pick<
                  PartSpec,
                  "messageId" | "contentId"
                >
                resource: { __typename?: "PartSpec" } & Pick<
                  PartSpec,
                  "messageId" | "contentId"
                >
              }
          >
          from: { __typename?: "Address" } & Pick<
            Address,
            "name" | "mailbox" | "host"
          >
          editedBy: Maybe<
            { __typename?: "Address" } & Pick<
              Address,
              "name" | "mailbox" | "host"
            >
          >
        }
    >
    replyRecipients: { __typename?: "Participants" } & {
      from: Maybe<
        Array<
          { __typename?: "Address" } & Pick<
            Address,
            "name" | "mailbox" | "host"
          >
        >
      >
      to: Array<
        { __typename?: "Address" } & Pick<Address, "name" | "mailbox" | "host">
      >
      cc: Array<
        { __typename?: "Address" } & Pick<Address, "name" | "mailbox" | "host">
      >
    }
  }
export const AccountFieldsFragmentDoc: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AccountFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Account" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "email" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "loggedIn" },
            arguments: [],
            directives: []
          }
        ]
      }
    }
  ]
}
export const ConversationFieldsForListViewFragmentDoc: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ConversationFieldsForListView" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Conversation" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "date" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "from" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "host" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mailbox" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "name" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isRead" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isStarred" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "labels" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "snippet" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "subject" },
            arguments: [],
            directives: []
          }
        ]
      }
    }
  ]
}
export const ConversationFieldsForConversationViewFragmentDoc: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ConversationFieldsForConversationView" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Conversation" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "date" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "from" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "host" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mailbox" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "name" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isRead" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isStarred" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "labels" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "snippet" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "subject" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "presentableElements" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "id" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "isRead" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "isStarred" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "contents" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "revision" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "messageId" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "contentId" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "resource" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "messageId" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "contentId" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "type" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "subtype" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "disposition" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "filename" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "uri" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "date" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "from" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "editedAt" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "editedBy" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "replyRecipients" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromAccountId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "accountId" }
                }
              }
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "from" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "to" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "cc" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}
export const GetAllAccountsDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getAllAccounts" },
      variableDefinitions: [],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "accounts" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AccountFields" },
                  directives: []
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AccountFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Account" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "email" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "loggedIn" },
            arguments: [],
            directives: []
          }
        ]
      }
    }
  ]
}

export function useGetAllAccountsQuery(
  baseOptions?: ReactApolloHooks.QueryHookOptions<
    GetAllAccountsQuery,
    GetAllAccountsQueryVariables
  >
) {
  return ReactApolloHooks.useQuery<
    GetAllAccountsQuery,
    GetAllAccountsQueryVariables
  >(GetAllAccountsDocument, baseOptions)
}
export type GetAllAccountsQueryHookResult = ReturnType<
  typeof useGetAllAccountsQuery
>
export const GetAccountDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getAccount" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "accountId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "account" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "accountId" }
                }
              }
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: { kind: "Name", value: "AccountFields" },
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversations" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "label" },
                      value: {
                        kind: "StringValue",
                        value: "\\Inbox",
                        block: false
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "ConversationFieldsForListView"
                        },
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AccountFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Account" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "email" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "loggedIn" },
            arguments: [],
            directives: []
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ConversationFieldsForListView" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Conversation" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "date" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "from" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "host" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mailbox" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "name" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isRead" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isStarred" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "labels" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "snippet" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "subject" },
            arguments: [],
            directives: []
          }
        ]
      }
    }
  ]
}

export function useGetAccountQuery(
  baseOptions?: ReactApolloHooks.QueryHookOptions<
    GetAccountQuery,
    GetAccountQueryVariables
  >
) {
  return ReactApolloHooks.useQuery<GetAccountQuery, GetAccountQueryVariables>(
    GetAccountDocument,
    baseOptions
  )
}
export type GetAccountQueryHookResult = ReturnType<typeof useGetAccountQuery>
export const DeleteAccountDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "deleteAccount" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "accounts" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "delete" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "id" }
                      }
                    }
                  ],
                  directives: []
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

export function useDeleteAccountMutation(
  baseOptions?: ReactApolloHooks.MutationHookOptions<
    DeleteAccountMutation,
    DeleteAccountMutationVariables
  >
) {
  return ReactApolloHooks.useMutation<
    DeleteAccountMutation,
    DeleteAccountMutationVariables
  >(DeleteAccountDocument, baseOptions)
}
export type DeleteAccountMutationHookResult = ReturnType<
  typeof useDeleteAccountMutation
>
export const AddAccountDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "addAccount" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "email" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "accounts" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "create" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "email" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "email" }
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "AccountFields" },
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AccountFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Account" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "email" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "loggedIn" },
            arguments: [],
            directives: []
          }
        ]
      }
    }
  ]
}

export function useAddAccountMutation(
  baseOptions?: ReactApolloHooks.MutationHookOptions<
    AddAccountMutation,
    AddAccountMutationVariables
  >
) {
  return ReactApolloHooks.useMutation<
    AddAccountMutation,
    AddAccountMutationVariables
  >(AddAccountDocument, baseOptions)
}
export type AddAccountMutationHookResult = ReturnType<
  typeof useAddAccountMutation
>
export const AuthenticateDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "authenticate" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "accounts" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "authenticate" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "id" }
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "AccountFields" },
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AccountFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Account" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "email" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "loggedIn" },
            arguments: [],
            directives: []
          }
        ]
      }
    }
  ]
}

export function useAuthenticateMutation(
  baseOptions?: ReactApolloHooks.MutationHookOptions<
    AuthenticateMutation,
    AuthenticateMutationVariables
  >
) {
  return ReactApolloHooks.useMutation<
    AuthenticateMutation,
    AuthenticateMutationVariables
  >(AuthenticateDocument, baseOptions)
}
export type AuthenticateMutationHookResult = ReturnType<
  typeof useAuthenticateMutation
>
export const GetConversationDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getConversation" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "id" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "accountId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "conversation" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: { kind: "Variable", name: { kind: "Name", value: "id" } }
              }
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "FragmentSpread",
                  name: {
                    kind: "Name",
                    value: "ConversationFieldsForConversationView"
                  },
                  directives: []
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ConversationFieldsForConversationView" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Conversation" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "date" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "from" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "host" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mailbox" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "name" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isRead" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isStarred" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "labels" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "snippet" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "subject" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "presentableElements" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "id" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "isRead" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "isStarred" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "contents" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "revision" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "messageId" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "contentId" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "resource" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "messageId" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "contentId" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "type" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "subtype" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "disposition" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "filename" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "uri" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "date" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "from" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "editedAt" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "editedBy" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "replyRecipients" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromAccountId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "accountId" }
                }
              }
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "from" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "to" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "cc" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

export function useGetConversationQuery(
  baseOptions?: ReactApolloHooks.QueryHookOptions<
    GetConversationQuery,
    GetConversationQueryVariables
  >
) {
  return ReactApolloHooks.useQuery<
    GetConversationQuery,
    GetConversationQueryVariables
  >(GetConversationDocument, baseOptions)
}
export type GetConversationQueryHookResult = ReturnType<
  typeof useGetConversationQuery
>
export const SearchConversationsDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "searchConversations" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "accountId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "query" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "account" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "id" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "accountId" }
                }
              }
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "id" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "search" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "query" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "query" }
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "id" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "conversations" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "FragmentSpread",
                              name: {
                                kind: "Name",
                                value: "ConversationFieldsForListView"
                              },
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "loading" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "query" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ConversationFieldsForListView" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Conversation" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "date" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "from" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "host" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mailbox" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "name" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isRead" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isStarred" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "labels" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "snippet" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "subject" },
            arguments: [],
            directives: []
          }
        ]
      }
    }
  ]
}

export function useSearchConversationsQuery(
  baseOptions?: ReactApolloHooks.QueryHookOptions<
    SearchConversationsQuery,
    SearchConversationsQueryVariables
  >
) {
  return ReactApolloHooks.useQuery<
    SearchConversationsQuery,
    SearchConversationsQueryVariables
  >(SearchConversationsDocument, baseOptions)
}
export type SearchConversationsQueryHookResult = ReturnType<
  typeof useSearchConversationsQuery
>
export const SearchCachedConversationsDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "searchCachedConversations" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "query" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "specificityThreshold" }
          },
          type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "conversations" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "query" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "query" }
                }
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "specificityThreshold" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "specificityThreshold" }
                }
              }
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "conversation" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "id" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "messageId" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "subject" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "query" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

export function useSearchCachedConversationsQuery(
  baseOptions?: ReactApolloHooks.QueryHookOptions<
    SearchCachedConversationsQuery,
    SearchCachedConversationsQueryVariables
  >
) {
  return ReactApolloHooks.useQuery<
    SearchCachedConversationsQuery,
    SearchCachedConversationsQueryVariables
  >(SearchCachedConversationsDocument, baseOptions)
}
export type SearchCachedConversationsQueryHookResult = ReturnType<
  typeof useSearchCachedConversationsQuery
>
export const GetMatchingAddressesDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getMatchingAddresses" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "inputValue" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "String" } }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "addresses" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "inputValue" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "inputValue" }
                }
              }
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "host" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mailbox" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "name" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

export function useGetMatchingAddressesQuery(
  baseOptions?: ReactApolloHooks.QueryHookOptions<
    GetMatchingAddressesQuery,
    GetMatchingAddressesQueryVariables
  >
) {
  return ReactApolloHooks.useQuery<
    GetMatchingAddressesQuery,
    GetMatchingAddressesQueryVariables
  >(GetMatchingAddressesDocument, baseOptions)
}
export type GetMatchingAddressesQueryHookResult = ReturnType<
  typeof useGetMatchingAddressesQuery
>
export const SyncDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "sync" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "accountId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "accounts" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sync" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "accountId" }
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: { kind: "Name", value: "AccountFields" },
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "conversations" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "FragmentSpread",
                              name: {
                                kind: "Name",
                                value: "ConversationFieldsForListView"
                              },
                              directives: []
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "AccountFields" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Account" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "email" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "loggedIn" },
            arguments: [],
            directives: []
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ConversationFieldsForListView" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Conversation" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "date" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "from" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "host" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mailbox" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "name" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isRead" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isStarred" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "labels" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "snippet" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "subject" },
            arguments: [],
            directives: []
          }
        ]
      }
    }
  ]
}

export function useSyncMutation(
  baseOptions?: ReactApolloHooks.MutationHookOptions<
    SyncMutation,
    SyncMutationVariables
  >
) {
  return ReactApolloHooks.useMutation<SyncMutation, SyncMutationVariables>(
    SyncDocument,
    baseOptions
  )
}
export type SyncMutationHookResult = ReturnType<typeof useSyncMutation>
export const SetIsReadDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "setIsRead" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "conversationId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "isRead" }
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" }
            }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "conversations" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "setIsRead" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "conversationId" }
                      }
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "isRead" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "isRead" }
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "id" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "isRead" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

export function useSetIsReadMutation(
  baseOptions?: ReactApolloHooks.MutationHookOptions<
    SetIsReadMutation,
    SetIsReadMutationVariables
  >
) {
  return ReactApolloHooks.useMutation<
    SetIsReadMutation,
    SetIsReadMutationVariables
  >(SetIsReadDocument, baseOptions)
}
export type SetIsReadMutationHookResult = ReturnType<
  typeof useSetIsReadMutation
>
export const ArchiveDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "archive" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "conversationId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "conversations" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "archive" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "conversationId" }
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "ConversationFieldsForListView"
                        },
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ConversationFieldsForListView" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Conversation" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "date" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "from" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "host" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mailbox" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "name" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isRead" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isStarred" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "labels" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "snippet" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "subject" },
            arguments: [],
            directives: []
          }
        ]
      }
    }
  ]
}

export function useArchiveMutation(
  baseOptions?: ReactApolloHooks.MutationHookOptions<
    ArchiveMutation,
    ArchiveMutationVariables
  >
) {
  return ReactApolloHooks.useMutation<
    ArchiveMutation,
    ArchiveMutationVariables
  >(ArchiveDocument, baseOptions)
}
export type ArchiveMutationHookResult = ReturnType<typeof useArchiveMutation>
export const FlagDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "flag" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "conversationIDs" }
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
              }
            }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "isFlagged" }
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" }
            }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "conversations" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "flag" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "ids" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "conversationIDs" }
                      }
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "isFlagged" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "isFlagged" }
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "presentableElements" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "isStarred" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "id" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "isStarred" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

export function useFlagMutation(
  baseOptions?: ReactApolloHooks.MutationHookOptions<
    FlagMutation,
    FlagMutationVariables
  >
) {
  return ReactApolloHooks.useMutation<FlagMutation, FlagMutationVariables>(
    FlagDocument,
    baseOptions
  )
}
export type FlagMutationHookResult = ReturnType<typeof useFlagMutation>
export const FlagPresentableDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "flagPresentable" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "presentableId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "conversationId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "isFlagged" }
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" }
            }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "conversations" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "flagPresentable" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "presentableId" }
                      }
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "conversationId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "conversationId" }
                      }
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "isFlagged" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "isFlagged" }
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "presentableElements" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "isStarred" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "id" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "isStarred" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

export function useFlagPresentableMutation(
  baseOptions?: ReactApolloHooks.MutationHookOptions<
    FlagPresentableMutation,
    FlagPresentableMutationVariables
  >
) {
  return ReactApolloHooks.useMutation<
    FlagPresentableMutation,
    FlagPresentableMutationVariables
  >(FlagPresentableDocument, baseOptions)
}
export type FlagPresentableMutationHookResult = ReturnType<
  typeof useFlagPresentableMutation
>
export const SendMessageDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "sendMessage" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "accountId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "message" }
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "MessageInput" }
            }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "conversations" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "sendMessage" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "accountId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "accountId" }
                      }
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "message" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "message" }
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "ConversationFieldsForConversationView"
                        },
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ConversationFieldsForConversationView" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Conversation" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "date" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "from" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "host" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mailbox" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "name" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isRead" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isStarred" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "labels" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "snippet" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "subject" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "presentableElements" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "id" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "isRead" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "isStarred" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "contents" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "revision" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "messageId" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "contentId" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "resource" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "messageId" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "contentId" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "type" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "subtype" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "disposition" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "filename" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "uri" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "date" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "from" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "editedAt" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "editedBy" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "replyRecipients" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromAccountId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "accountId" }
                }
              }
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "from" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "to" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "cc" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

export function useSendMessageMutation(
  baseOptions?: ReactApolloHooks.MutationHookOptions<
    SendMessageMutation,
    SendMessageMutationVariables
  >
) {
  return ReactApolloHooks.useMutation<
    SendMessageMutation,
    SendMessageMutationVariables
  >(SendMessageDocument, baseOptions)
}
export type SendMessageMutationHookResult = ReturnType<
  typeof useSendMessageMutation
>
export const EditDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "edit" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "accountId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "conversationId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "resource" }
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "PartSpecInput" }
            }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "revision" }
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "PartSpecInput" }
            }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "content" }
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ContentInput" }
            }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "conversations" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "edit" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "accountId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "accountId" }
                      }
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "conversationId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "conversationId" }
                      }
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "resource" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "resource" }
                      }
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "revision" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "revision" }
                      }
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "content" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "content" }
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "ConversationFieldsForConversationView"
                        },
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ConversationFieldsForConversationView" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Conversation" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "date" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "from" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "host" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mailbox" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "name" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isRead" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isStarred" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "labels" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "snippet" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "subject" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "presentableElements" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "id" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "isRead" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "isStarred" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "contents" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "revision" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "messageId" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "contentId" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "resource" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "messageId" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "contentId" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "type" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "subtype" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "disposition" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "filename" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "uri" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "date" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "from" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "editedAt" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "editedBy" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "replyRecipients" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromAccountId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "accountId" }
                }
              }
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "from" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "to" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "cc" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

export function useEditMutation(
  baseOptions?: ReactApolloHooks.MutationHookOptions<
    EditMutation,
    EditMutationVariables
  >
) {
  return ReactApolloHooks.useMutation<EditMutation, EditMutationVariables>(
    EditDocument,
    baseOptions
  )
}
export type EditMutationHookResult = ReturnType<typeof useEditMutation>
export const ReplyDocument: DocumentNode = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "reply" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "accountId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "conversationId" }
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "ID" } }
          },
          directives: []
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "content" }
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "ContentInput" }
            }
          },
          directives: []
        }
      ],
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "conversations" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "reply" },
                  arguments: [
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "accountId" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "accountId" }
                      }
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "id" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "conversationId" }
                      }
                    },
                    {
                      kind: "Argument",
                      name: { kind: "Name", value: "content" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "content" }
                      }
                    }
                  ],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "FragmentSpread",
                        name: {
                          kind: "Name",
                          value: "ConversationFieldsForConversationView"
                        },
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "ConversationFieldsForConversationView" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Conversation" }
      },
      directives: [],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "id" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "date" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "from" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "host" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "mailbox" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "name" },
                  arguments: [],
                  directives: []
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isRead" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "isStarred" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "labels" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "snippet" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "subject" },
            arguments: [],
            directives: []
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "presentableElements" },
            arguments: [],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "id" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "isRead" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "isStarred" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "contents" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "revision" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "messageId" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "contentId" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "resource" },
                        arguments: [],
                        directives: [],
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "messageId" },
                              arguments: [],
                              directives: []
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "contentId" },
                              arguments: [],
                              directives: []
                            }
                          ]
                        }
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "type" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "subtype" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "disposition" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "filename" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "uri" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "date" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "from" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "editedAt" },
                  arguments: [],
                  directives: []
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "editedBy" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "replyRecipients" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "fromAccountId" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "accountId" }
                }
              }
            ],
            directives: [],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "from" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "to" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "cc" },
                  arguments: [],
                  directives: [],
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "name" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "mailbox" },
                        arguments: [],
                        directives: []
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "host" },
                        arguments: [],
                        directives: []
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}

export function useReplyMutation(
  baseOptions?: ReactApolloHooks.MutationHookOptions<
    ReplyMutation,
    ReplyMutationVariables
  >
) {
  return ReactApolloHooks.useMutation<ReplyMutation, ReplyMutationVariables>(
    ReplyDocument,
    baseOptions
  )
}
export type ReplyMutationHookResult = ReturnType<typeof useReplyMutation>
