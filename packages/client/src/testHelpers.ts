import * as enzyme from "enzyme"
import * as React from "react"

let mounts: enzyme.ReactWrapper[] = []

afterEach(() => {
  for (const m of mounts) {
    m.unmount()
  }
  mounts = []
})

export function mount(element: React.ReactElement): enzyme.ReactWrapper {
  const wrapper = enzyme.mount(element)
  mounts.push(wrapper)
  return wrapper
}
