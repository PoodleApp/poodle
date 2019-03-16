// E.g., '\\All', '\\Inbox', '\\Drafts'
export type BoxSpecifier = ({ name: string } | { attribute: string }) & {
  readonly?: boolean
}
