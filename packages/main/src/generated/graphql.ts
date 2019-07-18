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

export type ResolverTypeWrapper<T> = Promise<T> | T

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
  Query: ResolverTypeWrapper<{}>
  ID: ResolverTypeWrapper<Scalars["ID"]>
  Account: ResolverTypeWrapper<Account>
  String: ResolverTypeWrapper<Scalars["String"]>
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>
  Conversation: ResolverTypeWrapper<Conversation>
  Address: ResolverTypeWrapper<Address>
  Presentable: ResolverTypeWrapper<Presentable>
  Content: ResolverTypeWrapper<Content>
  PartSpec: ResolverTypeWrapper<PartSpec>
  Participants: ResolverTypeWrapper<Participants>
  Message: ResolverTypeWrapper<Message>
  Int: ResolverTypeWrapper<Scalars["Int"]>
  ConversationSearchResult: ResolverTypeWrapper<
    Omit<ConversationSearchResult, "conversation"> & {
      conversation: ResolversTypes["Conversation"]
    }
  >
  Mutation: ResolverTypeWrapper<{}>
  AccountMutations: ResolverTypeWrapper<AccountMutations>
  ConversationMutations: ResolverTypeWrapper<ConversationMutations>
  PartSpecInput: PartSpecInput
  ContentInput: ContentInput
  MessageInput: MessageInput
  AddressInput: AddressInput
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
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
  Int: Scalars["Int"]
  ConversationSearchResult: Omit<ConversationSearchResult, "conversation"> & {
    conversation: ResolversTypes["Conversation"]
  }
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
  ParentType = ResolversParentTypes["Account"]
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
  ParentType = ResolversParentTypes["AccountMutations"]
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
  ParentType = ResolversParentTypes["Address"]
> = {
  host?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  mailbox?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
}

export type ContentResolvers<
  ContextType = any,
  ParentType = ResolversParentTypes["Content"]
> = {
  resource?: Resolver<ResolversTypes["PartSpec"], ParentType, ContextType>
  revision?: Resolver<ResolversTypes["PartSpec"], ParentType, ContextType>
  type?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  subtype?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  content?: Resolver<ResolversTypes["String"], ParentType, ContextType>
}

export type ConversationResolvers<
  ContextType = any,
  ParentType = ResolversParentTypes["Conversation"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  date?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  from?: Resolver<ResolversTypes["Address"], ParentType, ContextType>
  labels?: Resolver<
    Maybe<Array<ResolversTypes["String"]>>,
    ParentType,
    ContextType
  >
  messageId?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  presentableElements?: Resolver<
    Array<ResolversTypes["Presentable"]>,
    ParentType,
    ContextType
  >
  isRead?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>
  isStarred?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>
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
  ParentType = ResolversParentTypes["ConversationMutations"]
> = {
  archive?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    ConversationMutationsArchiveArgs
  >
  flag?: Resolver<
    Array<ResolversTypes["Conversation"]>,
    ParentType,
    ContextType,
    ConversationMutationsFlagArgs
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

export type ConversationSearchResultResolvers<
  ContextType = any,
  ParentType = ResolversParentTypes["ConversationSearchResult"]
> = {
  conversation?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType
  >
  query?: Resolver<ResolversTypes["String"], ParentType, ContextType>
}

export type MessageResolvers<
  ContextType = any,
  ParentType = ResolversParentTypes["Message"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  date?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  messageId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  subject?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  from?: Resolver<Array<ResolversTypes["Address"]>, ParentType, ContextType>
}

export type MutationResolvers<
  ContextType = any,
  ParentType = ResolversParentTypes["Mutation"]
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
  ParentType = ResolversParentTypes["Participants"]
> = {
  from?: Resolver<
    Maybe<Array<ResolversTypes["Address"]>>,
    ParentType,
    ContextType
  >
  to?: Resolver<Array<ResolversTypes["Address"]>, ParentType, ContextType>
  cc?: Resolver<Array<ResolversTypes["Address"]>, ParentType, ContextType>
  replyTo?: Resolver<
    Maybe<Array<ResolversTypes["Address"]>>,
    ParentType,
    ContextType
  >
}

export type PartSpecResolvers<
  ContextType = any,
  ParentType = ResolversParentTypes["PartSpec"]
> = {
  messageId?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  contentId?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
}

export type PresentableResolvers<
  ContextType = any,
  ParentType = ResolversParentTypes["Presentable"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  isRead?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>
  isStarred?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>
  contents?: Resolver<Array<ResolversTypes["Content"]>, ParentType, ContextType>
  date?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  from?: Resolver<ResolversTypes["Address"], ParentType, ContextType>
  editedAt?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  editedBy?: Resolver<Maybe<ResolversTypes["Address"]>, ParentType, ContextType>
}

export type QueryResolvers<
  ContextType = any,
  ParentType = ResolversParentTypes["Query"]
> = {
  account?: Resolver<
    Maybe<ResolversTypes["Account"]>,
    ParentType,
    ContextType,
    QueryAccountArgs
  >
  accounts?: Resolver<Array<ResolversTypes["Account"]>, ParentType, ContextType>
  addresses?: Resolver<
    Array<ResolversTypes["Address"]>,
    ParentType,
    ContextType,
    QueryAddressesArgs
  >
  conversation?: Resolver<
    Maybe<ResolversTypes["Conversation"]>,
    ParentType,
    ContextType,
    QueryConversationArgs
  >
  conversations?: Resolver<
    Array<ResolversTypes["ConversationSearchResult"]>,
    ParentType,
    ContextType,
    QueryConversationsArgs
  >
}

export type Resolvers<ContextType = any> = {
  Account?: AccountResolvers<ContextType>
  AccountMutations?: AccountMutationsResolvers<ContextType>
  Address?: AddressResolvers<ContextType>
  Content?: ContentResolvers<ContextType>
  Conversation?: ConversationResolvers<ContextType>
  ConversationMutations?: ConversationMutationsResolvers<ContextType>
  ConversationSearchResult?: ConversationSearchResultResolvers<ContextType>
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
