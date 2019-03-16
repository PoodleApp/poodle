import { Base64Decode } from "base64-stream"
import * as libqp from "libqp"

import { Readable } from "stream"

export function decode(encoding: string, content: Readable): Readable {
  switch (encoding) {
    case "7BIT":
      return content
    case "8BIT":
      return content
    case "BASE64":
      return content.pipe(new Base64Decode())
    case "QUOTED-PRINTABLE":
      return content.pipe(new libqp.Decoder())
    default:
      throw new Error(`unknown encoding: ${encoding}`)
  }
}
