declare module "node-email-reply-parser" {
  export interface EmailContent {
    getFragments(): Fragment[]
    getVisibleText(): string
  }

  export interface Fragment {
    getContent(): string
    isSignature(): boolean
    isQuoted(): boolean
    isHidden(): boolean
    isEmpty(): boolean
  }

  export default function replyParser(
    content: string,
    onlyVisibleText: true
  ): string
  export default function replyParser(
    content: string,
    onlyVisibleText?: false
  ): EmailContent
}
