export default function debounce(
  func: Function,
  wait: number,
  immediate: boolean
) {
  let timeout: any
  return function(this: any, ...args: any[]) {
    let later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    let callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}
