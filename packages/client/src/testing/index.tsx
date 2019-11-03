import { MockedProvider } from "@apollo/react-testing"
import { MockedProviderProps } from "@apollo/react-testing/lib/mocks/MockedProvider"
import * as enzyme from "enzyme"
import { createMemoryHistory, History } from "history"
import * as React from "react"
import { Router } from "react-router-dom"

let mounts: enzyme.ReactWrapper[] = []

afterEach(() => {
  for (const m of mounts) {
    m.unmount()
  }
  mounts = []
})

export function mount(
  element: React.ReactElement,
  {
    mocks = [],
    route = "/",
    history = createMemoryHistory({ initialEntries: [route] })
  }: {
    history?: History<unknown>
    mocks?: MockedProviderProps["mocks"]
    route?: string
  } = {}
): enzyme.ReactWrapper {
  const wrapper = enzyme.mount(
    <MockedProvider mocks={mocks}>
      <Router history={history}>{element}</Router>
    </MockedProvider>
  )
  mounts.push(wrapper)
  return wrapper
}

export function delay(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Assumes that `fn` was imported from a module mocked using
// `jest.mock(modulePath)`
export function mock<F extends (...args: any[]) => any>(
  fn: F
): jest.Mock<ReturnType<F>, Parameters<F>> {
  return fn as any
}

/**
 * Produces a delay, and calls `.update()` on the given `ReactWrapper`. Use this
 * function when you want to wait for a component to update after an
 * asynchronous state change.
 *
 * @param wrapper Enzyme wrapper around a React component that will update
 * @param ms minimum number of milliseconds to wait
 */
export async function updates(
  wrapper: enzyme.ReactWrapper,
  ms: number = 0
): Promise<void> {
  await delay(ms)
  wrapper.update()
}
