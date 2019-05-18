declare module "buildmail" {
  import { Readable, ReadableOptions } from "stream"

  export interface BuildMailOptions {
    filename?: string
    baseBoundary?: string
    keepBcc?: boolean
    textEncoding?: "base64" | "quoted-printable"
    hostname?: string
    disableUrlAccess?: boolean
    disableFileAccess?: boolean
  }

  export type DataSource =
    | string
    | Buffer
    | Readable
    | { path: string }
    | { href: string }

  export default class BuildMail {
    baseBoundary: string
    baseBoundaryPrefix: string
    childNodes: this[]
    date: Date
    disableFileAccess: boolean
    disableUrlAccess: boolean
    filename?: string
    hostname?: string
    keepBcc: boolean
    nodeCounter: number
    parentNode?: this
    options: BuildMailOptions
    rootNode: this
    textEncoding: string

    constructor(contentType: string, options?: BuildMailOptions)
    createChild(contentType: string, options?: BuildMailOptions): BuildMail
    appendChild(childNode: BuildMail): BuildMail
    replace(replacementNode: BuildMail): BuildMail
    remove(): this
    setHeader(key: string, value: string): this
    setHeader(headers: Array<{ key: string; value: string }>): this
    setHeader(headers: Record<string, string>): this
    addHeader(key: string, value: string): this
    addHeader(headers: Array<{ key: string; value: string }>): this
    addHeader(headers: Record<string, string>): this
    getHeader(key: string): string | undefined
    buildHeaders(): string
    setContent(content: DataSource): this
    setRaw(message: DataSource): this
    build(
      callback: ((error: Error) => void) &
        ((error: null, message: Buffer) => void)
    ): void
    createReadStream(options?: ReadableOptions): Readable
    setEnvelope(envelope: Record<string, string | string[]>): this
    getEnvelope(): Record<string, string | string[]>
    messageId(): string
    getAddresses(): Record<string, Array<{ name: string; address: string }>>
  }
}
