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

export type AccountMutations = {
  create: Account
  authenticate: Account
  sync: Account
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

export type Address = {
  host: Scalars["String"]
  mailbox: Scalars["String"]
  name?: Maybe<Scalars["String"]>
}

export type Content = {
  type: Scalars["String"]
  subtype: Scalars["String"]
  content: Scalars["String"]
}

export type Conversation = {
  id: Scalars["ID"]
  date: Scalars["String"]
  from: Address
  presentableElements: Array<Presentable>
  isRead: Scalars["Boolean"]
  subject?: Maybe<Scalars["String"]>
}

export type Message = {
  id: Scalars["ID"]
  date: Scalars["String"]
  messageId: Scalars["ID"]
  subject?: Maybe<Scalars["String"]>
  from: Array<Address>
}

export type Mutation = {
  accounts: AccountMutations
}

export type Presentable = {
  id: Scalars["ID"]
  contents: Array<Content>
  date: Scalars["String"]
  from: Address
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
            "id" | "date" | "isRead" | "subject"
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
      "id" | "isRead" | "subject"
    > & {
        presentableElements: Array<
          { __typename?: "Presentable" } & Pick<Presentable, "id" | "date"> & {
              contents: Array<
                { __typename?: "Content" } & Pick<
                  Content,
                  "type" | "subtype" | "content"
                >
              >
              from: { __typename?: "Address" } & Pick<
                Address,
                "name" | "mailbox" | "host"
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
            "id" | "date" | "isRead" | "subject"
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