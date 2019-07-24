import debounce from "./debounce"

jest.useFakeTimers()

describe("debounce", () => {
  let func: jest.Mock
  let debouncedFunc: Function

  beforeEach(() => {
    func = jest.fn()
    debouncedFunc = debounce(func, 3000, false)
  })

  it("executes after 3 sec delay when called multiple times", () => {
    for (let i = 0; i < 300; i++) {
      debouncedFunc()
    }

    jest.runAllTimers()

    expect(func).toBeCalledTimes(1)
  })
})
