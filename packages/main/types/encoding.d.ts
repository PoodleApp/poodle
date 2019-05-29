declare module "encoding" {
  export function convert(
    text: Buffer | string,
    toCharset: string,
    fromCharset?: string
  ): Buffer
}
