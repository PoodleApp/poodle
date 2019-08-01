import * as kefir from "kefir"
import { takeAll } from "./kefir"

describe("takeAll", () => {
  it("accumulates results from a stream into a promise", () => {
    const obs = kefir.sequentially(0, [1, 2, 3])
    return expect(takeAll(obs)).resolves.toEqual([1, 2, 3])
  })

  it("produces a rejected promise if the input observable emits an error after emitting a value", () => {
    const obs = kefir
      .sequentially(0, [1, 2, 3])
      .concat(kefir.constantError(new Error("an error")))
    return expect(takeAll(obs)).rejects.toThrow("an error")
  })
})
