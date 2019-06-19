import { MockedProvider } from "@apollo/react-testing"
import { MockedProviderProps } from "@apollo/react-testing/lib/mocks/MockedProvider"
import {
  createHistory,
  createMemorySource,
  History,
  LocationProvider
} from "@reach/router"
import * as enzyme from "enzyme"
import * as React from "react"

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
    history = createHistory(createMemorySource(route)),
    resolvers
  }: {
    history?: History
    mocks?: MockedProviderProps["mocks"]
    route?: string
    resolvers?: MockedProviderProps["resolvers"]
  }
): enzyme.ReactWrapper {
  const wrapper = enzyme.mount(
    <MockedProvider addTypename={false} mocks={mocks} resolvers={resolvers}>
      <LocationProvider history={history}>{element}</LocationProvider>
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
