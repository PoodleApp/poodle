import { MockedProvider } from "@apollo/react-testing"
import { MockedProviderProps } from "@apollo/react-testing/lib/mocks/MockedProvider"
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
  props: MockedProviderProps = {}
): enzyme.ReactWrapper {
  const wrapper = enzyme.mount(
    <MockedProvider {...props}>{element}</MockedProvider>
  )
  mounts.push(wrapper)
  return wrapper
}

export function delay(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
