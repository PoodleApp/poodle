declare module "string-to-stream" {
  import { Readable } from "stream"
  export default function stringToStream(input: string): Readable
}
