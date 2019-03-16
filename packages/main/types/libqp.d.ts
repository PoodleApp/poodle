declare module "libqp" {
  import { Duplex, DuplexOptions } from "stream"

  export function decode(val: string): Buffer
  export function encode(val: Buffer | string): string
  export function wrap(str: string, lineLength?: number): string

  export class Decoder extends Duplex {}

  export interface EncoderOptions extends DuplexOptions {
    lineLength?: number | false
  }

  export class Encoder extends Duplex {
    constructor(options?: EncoderOptions)
  }
}
