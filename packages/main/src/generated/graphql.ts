/* eslint-disable */

type Maybe<T> = T | null
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
  reply: Conversation
  setIsRead: Conversation
}

export type ConversationMutationsArchiveArgs = {
  id: Scalars["ID"]
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

export type Message = {
  id: Scalars["ID"]
  date: Scalars["String"]
  messageId: Scalars["ID"]
  subject?: Maybe<Scalars["String"]>
  from: Array<Address>
}

export type Mutation = {
  accounts: AccountMutations
  conversations: ConversationMutations
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
import {
  Account,
  AccountMutations,
  ConversationMutations,
  Message
} from "../resolvers/types"
import { Conversation } from "../models/conversation"

import { GraphQLResolveInfo } from "graphql"

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

export type AccountResolvers<Context = any, ParentType = Account> = {
  id?: Resolver<Scalars["ID"], ParentType, Context>
  email?: Resolver<Scalars["String"], ParentType, Context>
  loggedIn?: Resolver<Scalars["Boolean"], ParentType, Context>
  conversations?: Resolver<
    Array<Conversation>,
    ParentType,
    Context,
    AccountConversationsArgs
  >
  messages?: Resolver<Array<Message>, ParentType, Context>
}

export type AccountMutationsResolvers<
  Context = any,
  ParentType = AccountMutations
> = {
  create?: Resolver<Account, ParentType, Context, AccountMutationsCreateArgs>
  authenticate?: Resolver<
    Account,
    ParentType,
    Context,
    AccountMutationsAuthenticateArgs
  >
  sync?: Resolver<Account, ParentType, Context, AccountMutationsSyncArgs>
}

export type AddressResolvers<Context = any, ParentType = Address> = {
  host?: Resolver<Scalars["String"], ParentType, Context>
  mailbox?: Resolver<Scalars["String"], ParentType, Context>
  name?: Resolver<Maybe<Scalars["String"]>, ParentType, Context>
}

export type ContentResolvers<Context = any, ParentType = Content> = {
  type?: Resolver<Scalars["String"], ParentType, Context>
  subtype?: Resolver<Scalars["String"], ParentType, Context>
  content?: Resolver<Scalars["String"], ParentType, Context>
}

export type ConversationResolvers<Context = any, ParentType = Conversation> = {
  id?: Resolver<Scalars["ID"], ParentType, Context>
  date?: Resolver<Scalars["String"], ParentType, Context>
  from?: Resolver<Address, ParentType, Context>
  labels?: Resolver<Maybe<Array<Scalars["String"]>>, ParentType, Context>
  presentableElements?: Resolver<Array<Presentable>, ParentType, Context>
  isRead?: Resolver<Scalars["Boolean"], ParentType, Context>
  snippet?: Resolver<Maybe<Scalars["String"]>, ParentType, Context>
  subject?: Resolver<Maybe<Scalars["String"]>, ParentType, Context>
}

export type ConversationMutationsResolvers<
  Context = any,
  ParentType = ConversationMutations
> = {
  archive?: Resolver<
    Conversation,
    ParentType,
    Context,
    ConversationMutationsArchiveArgs
  >
  reply?: Resolver<
    Conversation,
    ParentType,
    Context,
    ConversationMutationsReplyArgs
  >
  setIsRead?: Resolver<
    Conversation,
    ParentType,
    Context,
    ConversationMutationsSetIsReadArgs
  >
}

export type MessageResolvers<Context = any, ParentType = Message> = {
  id?: Resolver<Scalars["ID"], ParentType, Context>
  date?: Resolver<Scalars["String"], ParentType, Context>
  messageId?: Resolver<Scalars["ID"], ParentType, Context>
  subject?: Resolver<Maybe<Scalars["String"]>, ParentType, Context>
  from?: Resolver<Array<Address>, ParentType, Context>
}

export type MutationResolvers<Context = any, ParentType = Mutation> = {
  accounts?: Resolver<AccountMutations, ParentType, Context>
  conversations?: Resolver<ConversationMutations, ParentType, Context>
}

export type PresentableResolvers<Context = any, ParentType = Presentable> = {
  id?: Resolver<Scalars["ID"], ParentType, Context>
  contents?: Resolver<Array<Content>, ParentType, Context>
  date?: Resolver<Scalars["String"], ParentType, Context>
  from?: Resolver<Address, ParentType, Context>
}

export type QueryResolvers<Context = any, ParentType = Query> = {
  account?: Resolver<Maybe<Account>, ParentType, Context, QueryAccountArgs>
  accounts?: Resolver<Array<Account>, ParentType, Context>
  conversation?: Resolver<
    Maybe<Conversation>,
    ParentType,
    Context,
    QueryConversationArgs
  >
}

export type Resolvers<Context = any> = {
  Account?: AccountResolvers<Context>
  AccountMutations?: AccountMutationsResolvers<Context>
  Address?: AddressResolvers<Context>
  Content?: ContentResolvers<Context>
  Conversation?: ConversationResolvers<Context>
  ConversationMutations?: ConversationMutationsResolvers<Context>
  Message?: MessageResolvers<Context>
  Mutation?: MutationResolvers<Context>
  Presentable?: PresentableResolvers<Context>
  Query?: QueryResolvers<Context>
}

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<Context = any> = Resolvers<Context>
