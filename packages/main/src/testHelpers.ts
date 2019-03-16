// Assumes that `fn` was imported from a module mocked using
// `jest.mock(modulePath)`
export function mock<F extends (...args: any[]) => any>(
  fn: F
): jest.Mock<ReturnType<F>, Parameters<F>> {
  return fn as any
}
