import debounce from "./debounce"

jest.useFakeTimers()

describe("debounce", () => {
  let func: jest.Mock
  let debouncedFunc: Function

  beforeEach(() => {
    func = jest.fn()
    debouncedFunc = debounce(func, 3000, true)
  })

  it("executes once over a period shorter than 3 seconds", () => {
    debouncedFunc()
    expect(func).toBeCalledTimes(1)

    for (let i = 0; i < 300; i++) {
      debouncedFunc()
    }

    jest.runAllTimers()

    expect(func).toBeCalledTimes(1)
  })

  it("calls func every 3 seconds over a period longer than 3 seconds", () => {
    debouncedFunc()
    expect(func).toBeCalledTimes(1)

    for (let i = 0; i < 10; i++) {
      debouncedFunc()
      jest.advanceTimersByTime(3000)
    }

    expect(func).toBeCalledTimes(10)
  })

  it("eventually calls func with the same argument as the last call to debouncedFunc", () => {
    let i
    let args: number[] = []

    for (i = 0; i < 5; i++) {
      const rando = Math.floor(Math.random() * 6 + 1)
      debouncedFunc(rando)
      args.push(rando)
      jest.advanceTimersByTime(3000)
    }

    jest.runAllTimers()

    expect(func).toBeCalledTimes(5)

    expect(func).lastCalledWith(args[i - 1])
  })
})
