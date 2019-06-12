/* eslint-disable */

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
  id: Scalars["ID"]
  email: Scalars["String"]
  loggedIn: Scalars["Boolean"]
  conversations: Array<Conversation>
  messages: Array<Message>
}

export type AccountConversationsArgs = {
  label?: Maybe<Scalars["String"]>
}

export type AccountMutations = {
  create: Account
  authenticate: Account
  sync: Account
  delete: Scalars["Boolean"]
}

export type AccountMutationsCreateArgs = {
  email: Scalars["String"]
}

export type AccountMutationsAuthenticateArgs = {
  id: Scalars["ID"]
}

export type AccountMutationsSyncArgs = {
  id: Scalars["ID"]
}

export type AccountMutationsDeleteArgs = {
  id: Scalars["ID"]
}

export type Address = {
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
  resource: PartSpec
  revision: PartSpec
  type: Scalars["String"]
  subtype: Scalars["String"]
  content: Scalars["String"]
}

export type ContentInput = {
  type: Scalars["String"]
  subtype: Scalars["String"]
  content: Scalars["String"]
}

export type Conversation = {
  id: Scalars["ID"]
  date: Scalars["String"]
  from: Address
  labels?: Maybe<Array<Scalars["String"]>>
  presentableElements: Array<Presentable>
  isRead: Scalars["Boolean"]
  snippet?: Maybe<Scalars["String"]>
  subject?: Maybe<Scalars["String"]>
}

export type ConversationMutations = {
  archive: Conversation
  edit: Conversation
  reply: Conversation
  setIsRead: Conversation
  sendMessage: Conversation
}

export type ConversationMutationsArchiveArgs = {
  id: Scalars["ID"]
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

export type Message = {
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
  accounts: AccountMutations
  conversations: ConversationMutations
}

export type PartSpec = {
  messageId: Scalars["String"]
  contentId?: Maybe<Scalars["String"]>
}

export type PartSpecInput = {
  messageId: Scalars["String"]
  contentId?: Maybe<Scalars["String"]>
}

export type Presentable = {
  id: Scalars["ID"]
  contents: Array<Content>
  date: Scalars["String"]
  from: Address
  editedAt?: Maybe<Scalars["String"]>
  editedBy?: Maybe<Address>
}

export type Query = {
  account?: Maybe<Account>
  accounts: Array<Account>
  conversation?: Maybe<Conversation>
}

export type QueryAccountArgs = {
  id: Scalars["ID"]
}

export type QueryConversationArgs = {
  id: Scalars["ID"]
}
export type GetAllAccountsQueryVariables = {}

export type GetAllAccountsQuery = { __typename?: "Query" } & {
  accounts: Array<
    { __typename?: "Account" } & Pick<Account, "id" | "email" | "loggedIn">
  >
}

export type GetAccountQueryVariables = {
  accountId: Scalars["ID"]
}

export type GetAccountQuery = { __typename?: "Query" } & {
  account: Maybe<
    { __typename?: "Account" } & Pick<Account, "id" | "email" | "loggedIn"> & {
        conversations: Array<
          { __typename?: "Conversation" } & Pick<
            Conversation,
            "id" | "date" | "isRead" | "labels" | "snippet" | "subject"
          > & {
              from: { __typename?: "Address" } & Pick<
                Address,
                "host" | "mailbox" | "name"
              >
            }
        >
      }
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
    create: { __typename?: "Account" } & Pick<
      Account,
      "id" | "email" | "loggedIn"
    >
  }
}

export type AuthenticateMutationVariables = {
  id: Scalars["ID"]
}

export type AuthenticateMutation = { __typename?: "Mutation" } & {
  accounts: { __typename?: "AccountMutations" } & {
    authenticate: { __typename?: "Account" } & Pick<
      Account,
      "id" | "email" | "loggedIn"
    >
  }
}

export type GetConversationQueryVariables = {
  id: Scalars["ID"]
}

export type GetConversationQuery = { __typename?: "Query" } & {
  conversation: Maybe<
    { __typename?: "Conversation" } & Pick<
      Conversation,
      "id" | "isRead" | "labels" | "snippet" | "subject"
    > & {
        presentableElements: Array<
          { __typename?: "Presentable" } & Pick<
            Presentable,
            "id" | "date" | "editedAt"
          > & {
              contents: Array<
                { __typename?: "Content" } & Pick<
                  Content,
                  "type" | "subtype" | "content"
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
      }
  >
}

export type SyncMutationVariables = {
  accountId: Scalars["ID"]
}

export type SyncMutation = { __typename?: "Mutation" } & {
  accounts: { __typename?: "AccountMutations" } & {
    sync: { __typename?: "Account" } & Pick<
      Account,
      "id" | "email" | "loggedIn"
    > & {
        conversations: Array<
          { __typename?: "Conversation" } & Pick<
            Conversation,
            "id" | "date" | "isRead" | "labels" | "snippet" | "subject"
          > & {
              from: { __typename?: "Address" } & Pick<
                Address,
                "host" | "mailbox" | "name"
              >
            }
        >
      }
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
      "id" | "date" | "isRead" | "labels" | "snippet" | "subject"
    > & {
        from: { __typename?: "Address" } & Pick<
          Address,
          "host" | "mailbox" | "name"
        >
      }
  }
}

export type ArchiveMutationVariables = {
  conversationId: Scalars["ID"]
}

export type ArchiveMutation = { __typename?: "Mutation" } & {
  conversations: { __typename?: "ConversationMutations" } & {
    archive: { __typename?: "Conversation" } & Pick<
      Conversation,
      "id" | "date" | "isRead" | "labels" | "snippet" | "subject"
    > & {
        from: { __typename?: "Address" } & Pick<
          Address,
          "host" | "mailbox" | "name"
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
    sendMessage: { __typename?: "Conversation" } & Pick<
      Conversation,
      "id" | "isRead" | "labels" | "snippet" | "subject"
    > & {
        presentableElements: Array<
          { __typename?: "Presentable" } & Pick<
            Presentable,
            "id" | "date" | "editedAt"
          > & {
              contents: Array<
                { __typename?: "Content" } & Pick<
                  Content,
                  "type" | "subtype" | "content"
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
      }
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
    edit: { __typename?: "Conversation" } & Pick<
      Conversation,
      "id" | "isRead" | "labels" | "snippet" | "subject"
    > & {
        presentableElements: Array<
          { __typename?: "Presentable" } & Pick<
            Presentable,
            "id" | "date" | "editedAt"
          > & {
              contents: Array<
                { __typename?: "Content" } & Pick<
                  Content,
                  "type" | "subtype" | "content"
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
      }
  }
}

export type ReplyMutationVariables = {
  accountId: Scalars["ID"]
  conversationId: Scalars["ID"]
  content: ContentInput
}

export type ReplyMutation = { __typename?: "Mutation" } & {
  conversations: { __typename?: "ConversationMutations" } & {
    reply: { __typename?: "Conversation" } & Pick<
      Conversation,
      "id" | "isRead" | "labels" | "snippet" | "subject"
    > & {
        presentableElements: Array<
          { __typename?: "Presentable" } & Pick<
            Presentable,
            "id" | "date" | "editedAt"
          > & {
              contents: Array<
                { __typename?: "Content" } & Pick<
                  Content,
                  "type" | "subtype" | "content"
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
      }
  }
}
import { DocumentNode } from "graphql"
import * as ReactApollo from "react-apollo"
import * as ReactApolloHooks from "react-apollo-hooks"
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

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
    }
  ]
}

export function useGetAllAccountsQuery(
  baseOptions?: ReactApolloHooks.QueryHookOptions<GetAllAccountsQueryVariables>
) {
  return ReactApolloHooks.useQuery<
    GetAllAccountsQuery,
    GetAllAccountsQueryVariables
  >(GetAllAccountsDocument, baseOptions)
}
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
          }
        ]
      }
    }
  ]
}

export function useGetAccountQuery(
  baseOptions?: ReactApolloHooks.QueryHookOptions<GetAccountQueryVariables>
) {
  return ReactApolloHooks.useQuery<GetAccountQuery, GetAccountQueryVariables>(
    GetAccountDocument,
    baseOptions
  )
}
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
export type DeleteAccountMutationFn = ReactApollo.MutationFn<
  DeleteAccountMutation,
  DeleteAccountMutationVariables
>

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
          }
        ]
      }
    }
  ]
}
export type AddAccountMutationFn = ReactApollo.MutationFn<
  AddAccountMutation,
  AddAccountMutationVariables
>

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
          }
        ]
      }
    }
  ]
}
export type AuthenticateMutationFn = ReactApollo.MutationFn<
  AuthenticateMutation,
  AuthenticateMutationVariables
>

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
                  kind: "Field",
                  name: { kind: "Name", value: "id" },
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
                  name: { kind: "Name", value: "isRead" },
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
    }
  ]
}

export function useGetConversationQuery(
  baseOptions?: ReactApolloHooks.QueryHookOptions<GetConversationQueryVariables>
) {
  return ReactApolloHooks.useQuery<
    GetConversationQuery,
    GetConversationQueryVariables
  >(GetConversationDocument, baseOptions)
}
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
                }
              ]
            }
          }
        ]
      }
    }
  ]
}
export type SyncMutationFn = ReactApollo.MutationFn<
  SyncMutation,
  SyncMutationVariables
>

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
          }
        ]
      }
    }
  ]
}
export type SetIsReadMutationFn = ReactApollo.MutationFn<
  SetIsReadMutation,
  SetIsReadMutationVariables
>

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
          }
        ]
      }
    }
  ]
}
export type ArchiveMutationFn = ReactApollo.MutationFn<
  ArchiveMutation,
  ArchiveMutationVariables
>

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
                        kind: "Field",
                        name: { kind: "Name", value: "id" },
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
                                          name: {
                                            kind: "Name",
                                            value: "messageId"
                                          },
                                          arguments: [],
                                          directives: []
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "contentId"
                                          },
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
                                          name: {
                                            kind: "Name",
                                            value: "messageId"
                                          },
                                          arguments: [],
                                          directives: []
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "contentId"
                                          },
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
                        name: { kind: "Name", value: "isRead" },
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
          }
        ]
      }
    }
  ]
}
export type SendMessageMutationFn = ReactApollo.MutationFn<
  SendMessageMutation,
  SendMessageMutationVariables
>

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
                        kind: "Field",
                        name: { kind: "Name", value: "id" },
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
                                          name: {
                                            kind: "Name",
                                            value: "messageId"
                                          },
                                          arguments: [],
                                          directives: []
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "contentId"
                                          },
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
                                          name: {
                                            kind: "Name",
                                            value: "messageId"
                                          },
                                          arguments: [],
                                          directives: []
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "contentId"
                                          },
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
                        name: { kind: "Name", value: "isRead" },
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
          }
        ]
      }
    }
  ]
}
export type EditMutationFn = ReactApollo.MutationFn<
  EditMutation,
  EditMutationVariables
>

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
                        kind: "Field",
                        name: { kind: "Name", value: "id" },
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
                                          name: {
                                            kind: "Name",
                                            value: "messageId"
                                          },
                                          arguments: [],
                                          directives: []
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "contentId"
                                          },
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
                                          name: {
                                            kind: "Name",
                                            value: "messageId"
                                          },
                                          arguments: [],
                                          directives: []
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "contentId"
                                          },
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
                        name: { kind: "Name", value: "isRead" },
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
          }
        ]
      }
    }
  ]
}
export type ReplyMutationFn = ReactApollo.MutationFn<
  ReplyMutation,
  ReplyMutationVariables
>

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
