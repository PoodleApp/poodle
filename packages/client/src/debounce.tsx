export default function debounce(
  func: Function,
  wait: number,
  immediate: boolean
) {
  let timeout: any
  return function(this: any, ...args: any[]) {
    const context = this
    let later = function() {
      timeout = null
      if (!immediate) func.apply(context, args)
    }
    let callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(context, args)
  }
}
