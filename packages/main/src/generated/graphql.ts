/* eslint-disable */
import { GraphQLResolveInfo } from "graphql"
import {
  Account,
  AccountMutations,
  ConversationMutations,
  Message
} from "../resolvers/types"
import { Conversation } from "../models/conversation"
export type Maybe<T> = T | null
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
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
}

export type AccountConversationsArgs = {
  label?: Maybe<Scalars["String"]>
}

export type AccountMutations = {
  __typename?: "AccountMutations"
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
  __typename?: "Conversation"
  id: Scalars["ID"]
  date: Scalars["String"]
  from: Address
  labels?: Maybe<Array<Scalars["String"]>>
  presentableElements: Array<Presentable>
  isRead: Scalars["Boolean"]
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
  from: Array<Address>
  to: Array<Address>
  cc: Array<Address>
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
  conversation?: Maybe<Conversation>
}

export type QueryAccountArgs = {
  id: Scalars["ID"]
}

export type QueryConversationArgs = {
  id: Scalars["ID"]
}

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult

export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>
}

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs>
  resolve?: SubscriptionResolveFn<TResult, TParent, TContext, TArgs>
}

export type SubscriptionResolver<
  TResult,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionResolverObject<TResult, TParent, TContext, TArgs>)
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes>

export type NextResolverFn<T> = () => Promise<T>

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: {}
  ID: Scalars["ID"]
  Account: Account
  String: Scalars["String"]
  Boolean: Scalars["Boolean"]
  Conversation: Conversation
  Address: Address
  Presentable: Presentable
  Content: Content
  PartSpec: PartSpec
  Participants: Participants
  Message: Message
  Mutation: {}
  AccountMutations: AccountMutations
  ConversationMutations: ConversationMutations
  PartSpecInput: PartSpecInput
  ContentInput: ContentInput
  MessageInput: MessageInput
  AddressInput: AddressInput
}

export type AccountResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Account"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  email?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  loggedIn?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>
  conversations?: Resolver<
    Array<ResolversTypes["Conversation"]>,
    ParentType,
    ContextType,
    AccountConversationsArgs
  >
  messages?: Resolver<Array<ResolversTypes["Message"]>, ParentType, ContextType>
}

export type AccountMutationsResolvers<
  ContextType = any,
  ParentType = ResolversTypes["AccountMutations"]
> = {
  create?: Resolver<
    ResolversTypes["Account"],
    ParentType,
    ContextType,
    AccountMutationsCreateArgs
  >
  authenticate?: Resolver<
    ResolversTypes["Account"],
    ParentType,
    ContextType,
    AccountMutationsAuthenticateArgs
  >
  sync?: Resolver<
    ResolversTypes["Account"],
    ParentType,
    ContextType,
    AccountMutationsSyncArgs
  >
  delete?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    AccountMutationsDeleteArgs
  >
}

export type AddressResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Address"]
> = {
  host?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  mailbox?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
}

export type ContentResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Content"]
> = {
  resource?: Resolver<ResolversTypes["PartSpec"], ParentType, ContextType>
  revision?: Resolver<ResolversTypes["PartSpec"], ParentType, ContextType>
  type?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  subtype?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  content?: Resolver<ResolversTypes["String"], ParentType, ContextType>
}

export type ConversationResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Conversation"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  date?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  from?: Resolver<ResolversTypes["Address"], ParentType, ContextType>
  labels?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >
  presentableElements?: Resolver<
    Array<ResolversTypes["Presentable"]>,
    ParentType,
    ContextType
  >
  isRead?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>
  replyRecipients?: Resolver<
    ResolversTypes["Participants"],
    ParentType,
    ContextType,
    ConversationReplyRecipientsArgs
  >
  snippet?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  subject?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
}

export type ConversationMutationsResolvers<
  ContextType = any,
  ParentType = ResolversTypes["ConversationMutations"]
> = {
  archive?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    ConversationMutationsArchiveArgs
  >
  edit?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    ConversationMutationsEditArgs
  >
  reply?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    ConversationMutationsReplyArgs
  >
  setIsRead?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    ConversationMutationsSetIsReadArgs
  >
  sendMessage?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    ConversationMutationsSendMessageArgs
  >
}

export type MessageResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Message"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  date?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  messageId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  subject?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  from?: Resolver<Array<ResolversTypes["Address"]>, ParentType, ContextType>
}

export type MutationResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Mutation"]
> = {
  accounts?: Resolver<
    ResolversTypes["AccountMutations"],
    ParentType,
    ContextType
  >
  conversations?: Resolver<
    ResolversTypes["ConversationMutations"],
    ParentType,
    ContextType
  >
}

export type ParticipantsResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Participants"]
> = {
  from?: Resolver<Array<ResolversTypes["Address"]>, ParentType, ContextType>
  to?: Resolver<Array<ResolversTypes["Address"]>, ParentType, ContextType>
  cc?: Resolver<Array<ResolversTypes["Address"]>, ParentType, ContextType>
}

export type PartSpecResolvers<
  ContextType = any,
  ParentType = ResolversTypes["PartSpec"]
> = {
  messageId?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  contentId?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
}

export type PresentableResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Presentable"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  contents?: Resolver<Array<ResolversTypes["Content"]>, ParentType, ContextType>
  date?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  from?: Resolver<ResolversTypes["Address"], ParentType, ContextType>
  editedAt?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  editedBy?: Resolver<Maybe<ResolversTypes["Address"]>, ParentType, ContextType>
}

export type QueryResolvers<
  ContextType = any,
  ParentType = ResolversTypes["Query"]
> = {
  account?: Resolver<
    Maybe<ResolversTypes["Account"]>,
    ParentType,
    ContextType,
    QueryAccountArgs
  >
  accounts?: Resolver<Array<ResolversTypes["Account"]>, ParentType, ContextType>
  conversation?: Resolver<
    Maybe<ResolversTypes["Conversation"]>,
    ParentType,
    ContextType,
    QueryConversationArgs
  >
}

export type Resolvers<ContextType = any> = {
  Account?: AccountResolvers<ContextType>
  AccountMutations?: AccountMutationsResolvers<ContextType>
  Address?: AddressResolvers<ContextType>
  Content?: ContentResolvers<ContextType>
  Conversation?: ConversationResolvers<ContextType>
  ConversationMutations?: ConversationMutationsResolvers<ContextType>
  Message?: MessageResolvers<ContextType>
  Mutation?: MutationResolvers<ContextType>
  Participants?: ParticipantsResolvers<ContextType>
  PartSpec?: PartSpecResolvers<ContextType>
  Presentable?: PresentableResolvers<ContextType>
  Query?: QueryResolvers<ContextType>
}

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>
