declare module "base64-stream" {
  import { Duplex } from "stream"

  export class Base64Decode extends Duplex {
    constructor()
  }

  export class Base64Encode extends Duplex {
    constructor(opts?: { lineLength?: number; prefix?: string })
  }
}
