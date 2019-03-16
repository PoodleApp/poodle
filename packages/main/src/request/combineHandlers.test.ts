import * as kefir from "kefir"
import { combineHandlers } from "./combineHandlers"

type Context = { count: number }

const { actions, actionTypes, perform } = combineHandlers({
  increment(context: Context, delta: number) {
    return kefir.constant(context.count + delta)
  },
  tagged(context: Context, delta: number, tag: string) {
    return kefir.constant([context.count + delta, tag] as const)
  },
  reset(context: Context) {
    return kefir.constant(context.count)
  }
})

it("produces action creators", () => {
  expect(actions.increment(2)).toEqual({
    type: "increment",
    payload: [2]
  })
  expect(actions.tagged(2, "some tag")).toEqual({
    type: "tagged",
    payload: [2, "some tag"]
  })
  expect(actions.reset()).toEqual({ type: "reset", payload: [] })
})

it("produces a map of `type` constants for each action type", () => {
  expect(actionTypes.increment).toBe("increment")
  expect(actionTypes.tagged).toBe("tagged")
  expect(actionTypes.reset).toBe("reset")
})

it("produces a perform that handles each action", async () => {
  expect(await perform({ count: 1 }, actions.increment(2)).toPromise()).toBe(3)
  expect(
    await perform({ count: 5 }, actions.tagged(2, "some tag")).toPromise()
  ).toEqual([7, "some tag"])
  expect(await perform({ count: 5 }, actions.reset()).toPromise()).toBe(5)
})

it("fails when given an action with an unrecognized type", () => {
  return expect(
    perform({ count: 5 }, { type: "otherAction", payload: [] }).toPromise()
  ).rejects.toThrow("No handler for action type, otherAction")
})

it("returns an observable with an error if a handler throws an exception", () => {
  const { actions, perform } = combineHandlers({
    throwsException(_context: Context) {
      throw new Error("should fail")
    }
  })
  return expect(
    perform({ count: 5 }, actions.throwsException()).toPromise()
  ).rejects.toThrow("should fail")
})
