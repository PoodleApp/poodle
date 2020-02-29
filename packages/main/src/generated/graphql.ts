/* eslint-disable */
import { GraphQLResolveInfo } from "graphql"
import {
  Account as AccountType,
  AccountMutations as AccountMutationsType,
  ConversationMutations as ConversationMutationsType,
  Message as MessageType
} from "../resolvers/types"
import { Conversation as ConversationType } from "../models/conversation"
import { Search as SearchType } from "../cache/types"
export type Maybe<T> = T | null
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X]
} &
  { [P in K]-?: NonNullable<T[P]> }

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

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes>

export type isTypeOfResolverFn<T = {}> = (
  obj: T,
  info: GraphQLResolveInfo
) => boolean

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
  Account: ResolverTypeWrapper<AccountType>
  String: ResolverTypeWrapper<Scalars["String"]>
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>
  Conversation: ResolverTypeWrapper<ConversationType>
  Address: ResolverTypeWrapper<Address>
  Presentable: ResolverTypeWrapper<Presentable>
  Content: ResolverTypeWrapper<Content>
  PartSpec: ResolverTypeWrapper<PartSpec>
  Disposition: Disposition
  Participants: ResolverTypeWrapper<Participants>
  Message: ResolverTypeWrapper<MessageType>
  Search: ResolverTypeWrapper<SearchType>
  Int: ResolverTypeWrapper<Scalars["Int"]>
  ConversationSearchResult: ResolverTypeWrapper<
    Omit<ConversationSearchResult, "conversation"> & {
      conversation: ResolversTypes["Conversation"]
    }
  >
  Mutation: ResolverTypeWrapper<{}>
  AccountMutations: ResolverTypeWrapper<AccountMutationsType>
  ConversationMutations: ResolverTypeWrapper<ConversationMutationsType>
  PartSpecInput: PartSpecInput
  ContentInput: ContentInput
  MessageInput: MessageInput
  AddressInput: AddressInput
}

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {}
  ID: Scalars["ID"]
  Account: AccountType
  String: Scalars["String"]
  Boolean: Scalars["Boolean"]
  Conversation: ConversationType
  Address: Address
  Presentable: Presentable
  Content: Content
  PartSpec: PartSpec
  Disposition: Disposition
  Participants: Participants
  Message: MessageType
  Search: SearchType
  Int: Scalars["Int"]
  ConversationSearchResult: Omit<ConversationSearchResult, "conversation"> & {
    conversation: ResolversParentTypes["Conversation"]
  }
  Mutation: {}
  AccountMutations: AccountMutationsType
  ConversationMutations: ConversationMutationsType
  PartSpecInput: PartSpecInput
  ContentInput: ContentInput
  MessageInput: MessageInput
  AddressInput: AddressInput
}

export type AccountResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Account"] = ResolversParentTypes["Account"]
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
  search?: Resolver<
    ResolversTypes["Search"],
    ParentType,
    ContextType,
    RequireFields<AccountSearchArgs, "query">
  >
  __isTypeOf?: isTypeOfResolverFn<ParentType>
}

export type AccountMutationsResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["AccountMutations"] = ResolversParentTypes["AccountMutations"]
> = {
  create?: Resolver<
    ResolversTypes["Account"],
    ParentType,
    ContextType,
    RequireFields<AccountMutationsCreateArgs, "email">
  >
  authenticate?: Resolver<
    ResolversTypes["Account"],
    ParentType,
    ContextType,
    RequireFields<AccountMutationsAuthenticateArgs, "id">
  >
  delete?: Resolver<
    ResolversTypes["Boolean"],
    ParentType,
    ContextType,
    RequireFields<AccountMutationsDeleteArgs, "id">
  >
  sync?: Resolver<
    ResolversTypes["Account"],
    ParentType,
    ContextType,
    RequireFields<AccountMutationsSyncArgs, "id">
  >
  __isTypeOf?: isTypeOfResolverFn<ParentType>
}

export type AddressResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Address"] = ResolversParentTypes["Address"]
> = {
  host?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  mailbox?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  __isTypeOf?: isTypeOfResolverFn<ParentType>
}

export type ContentResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Content"] = ResolversParentTypes["Content"]
> = {
  resource?: Resolver<ResolversTypes["PartSpec"], ParentType, ContextType>
  revision?: Resolver<ResolversTypes["PartSpec"], ParentType, ContextType>
  disposition?: Resolver<ResolversTypes["Disposition"], ParentType, ContextType>
  filename?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  name?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  type?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  subtype?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  content?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  uri?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  __isTypeOf?: isTypeOfResolverFn<ParentType>
}

export type ConversationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Conversation"] = ResolversParentTypes["Conversation"]
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
    RequireFields<ConversationReplyRecipientsArgs, "fromAccountId">
  >
  snippet?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  subject?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  __isTypeOf?: isTypeOfResolverFn<ParentType>
}

export type ConversationMutationsResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["ConversationMutations"] = ResolversParentTypes["ConversationMutations"]
> = {
  archive?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    RequireFields<ConversationMutationsArchiveArgs, "id">
  >
  flag?: Resolver<
    Array<ResolversTypes["Conversation"]>,
    ParentType,
    ContextType,
    RequireFields<ConversationMutationsFlagArgs, "ids" | "isFlagged">
  >
  flagPresentable?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    RequireFields<
      ConversationMutationsFlagPresentableArgs,
      "id" | "conversationId" | "isFlagged"
    >
  >
  edit?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    RequireFields<
      ConversationMutationsEditArgs,
      "accountId" | "conversationId" | "resource" | "revision" | "content"
    >
  >
  reply?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    RequireFields<
      ConversationMutationsReplyArgs,
      "accountId" | "id" | "content"
    >
  >
  setIsRead?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    RequireFields<ConversationMutationsSetIsReadArgs, "id" | "isRead">
  >
  sendMessage?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType,
    RequireFields<ConversationMutationsSendMessageArgs, "accountId" | "message">
  >
  __isTypeOf?: isTypeOfResolverFn<ParentType>
}

export type ConversationSearchResultResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["ConversationSearchResult"] = ResolversParentTypes["ConversationSearchResult"]
> = {
  conversation?: Resolver<
    ResolversTypes["Conversation"],
    ParentType,
    ContextType
  >
  query?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  __isTypeOf?: isTypeOfResolverFn<ParentType>
}

export type MessageResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Message"] = ResolversParentTypes["Message"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  date?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  messageId?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  subject?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  from?: Resolver<Array<ResolversTypes["Address"]>, ParentType, ContextType>
  __isTypeOf?: isTypeOfResolverFn<ParentType>
}

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"]
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
  ParentType extends ResolversParentTypes["Participants"] = ResolversParentTypes["Participants"]
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
  __isTypeOf?: isTypeOfResolverFn<ParentType>
}

export type PartSpecResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["PartSpec"] = ResolversParentTypes["PartSpec"]
> = {
  messageId?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  contentId?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  __isTypeOf?: isTypeOfResolverFn<ParentType>
}

export type PresentableResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Presentable"] = ResolversParentTypes["Presentable"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  isRead?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>
  isStarred?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>
  contents?: Resolver<Array<ResolversTypes["Content"]>, ParentType, ContextType>
  date?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  from?: Resolver<ResolversTypes["Address"], ParentType, ContextType>
  editedAt?: Resolver<Maybe<ResolversTypes["String"]>, ParentType, ContextType>
  editedBy?: Resolver<Maybe<ResolversTypes["Address"]>, ParentType, ContextType>
  __isTypeOf?: isTypeOfResolverFn<ParentType>
}

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = {
  account?: Resolver<
    Maybe<ResolversTypes["Account"]>,
    ParentType,
    ContextType,
    RequireFields<QueryAccountArgs, "id">
  >
  accounts?: Resolver<Array<ResolversTypes["Account"]>, ParentType, ContextType>
  addresses?: Resolver<
    Array<ResolversTypes["Address"]>,
    ParentType,
    ContextType,
    RequireFields<QueryAddressesArgs, "inputValue">
  >
  conversation?: Resolver<
    Maybe<ResolversTypes["Conversation"]>,
    ParentType,
    ContextType,
    RequireFields<QueryConversationArgs, "id">
  >
  conversations?: Resolver<
    Array<ResolversTypes["ConversationSearchResult"]>,
    ParentType,
    ContextType,
    RequireFields<QueryConversationsArgs, "query">
  >
}

export type SearchResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Search"] = ResolversParentTypes["Search"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>
  conversations?: Resolver<
    Array<ResolversTypes["Conversation"]>,
    ParentType,
    ContextType
  >
  loading?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>
  query?: Resolver<ResolversTypes["String"], ParentType, ContextType>
  __isTypeOf?: isTypeOfResolverFn<ParentType>
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
  Search?: SearchResolvers<ContextType>
}

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>
