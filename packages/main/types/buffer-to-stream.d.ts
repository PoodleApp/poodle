declare module "buffer-to-stream" {
  import { Readable } from "stream"
  export default function toStream(
    buffer: Buffer | string,
    chunkSize?: number
  ): Readable
}
