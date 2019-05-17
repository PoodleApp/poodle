export type Callback<T> = ((error: Error) => void) &
  ((error: null | undefined, value: T) => void)
export type Callback0 = (error?: Error | null) => void

export function lift0(fn: (cb: Callback0) => any): Promise<void> {
  return new Promise((resolve, reject) => {
    fn(err => {
      if (err) {
        reject(err)
      } else {
        resolve(undefined)
      }
    })
  })
}

export function lift1<T>(fn: (cb: Callback<T>) => any): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err: Error | null | undefined, value?: T) => {
      if (err) {
        reject(err)
      } else {
        resolve(value)
      }
    })
  })
}

export async function failOnUndefined<T>(
  p: Promise<T>
): Promise<NonNullable<T>> {
  const result = await p
  if (result == null) {
    throw new Error("undefined result")
  }
  return result as any
}
