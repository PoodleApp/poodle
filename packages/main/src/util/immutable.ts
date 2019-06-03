import { Collection, Seq } from "immutable"

/**
 * Remove duplicate elements from a collection
 *
 * @param fn - produces a value that Immutable.js can compare for equality
 * @param xs - the collection to de-deduplicate
 */
export function uniqBy<T, U, K = number>(
  fn: (value: T, key: K) => U,
  xs: Collection<K, T>
): Seq.Indexed<T> {
  return xs
    .groupBy(fn)
    .valueSeq()
    .map(values => values.first())
}
