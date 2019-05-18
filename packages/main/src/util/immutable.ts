import { Collection, Seq } from "immutable"

export function uniqBy<T, U, K = number>(
  fn: (value: T, key: K) => U,
  xs: Collection<K, T>
): Seq.Indexed<T> {
  return xs
    .groupBy(fn)
    .valueSeq()
    .map(values => values.first())
}
