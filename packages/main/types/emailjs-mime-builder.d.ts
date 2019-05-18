declare module "emailjs-mime-builder" {
  export type MimeNodeOptions = {
    rootNode?: MimeNode
    parentNode?: MimeNode
    baseBoundary?: string
    filename?: string
    includeBccInHeader?: boolean
  }

  export default class MimeNode {
    baseBoundary: string
    date: Date
    filename?: string
    includeBccInHeader: boolean
    parentNode?: MimeNode
    rootNode: MimeNode

    constructor(contentType: string, options?: MimeNodeOptions)
    createChild(contentType: string, options?: MimeNodeOptions): MimeNode // returns new node
    appendChild(childNode: MimeNode): MimeNode // returns appended node
    replace(node: MimeNode): MimeNode // returns replacement node
    remove(): MimeNode // returns the node that was removed
    setHeader(key: string, value: string): this
    setHeader(headers: Array<{ key: string; value: string }>): this
    setHeader(headers: Record<string, string>): this
    addHeader(key: string, value: string): this
    addHeader(headers: Array<{ key: string; value: string }>): this
    addHeader(headers: Record<string, string>): this
    getHeader(key: string): string | undefined
    setContent(content: string | Uint8Array): this
    build(): string
    getEnvelope(): Record<string, string | string[]>
  }
}
