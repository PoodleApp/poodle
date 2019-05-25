export type Callback<T> = ((error: Error) => void) &
  ((error: null, result: T) => void)

export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
