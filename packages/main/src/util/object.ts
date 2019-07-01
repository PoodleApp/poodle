export function mapObject<T extends object, V>(
  obj: T,
  fn: (v: T[keyof T]) => V
): { [K in keyof T]: ReturnType<typeof fn> } {
  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = fn(value)
  }
  return result
}
