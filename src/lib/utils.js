/**
 * @param {(...args: unknown[]) => void} fn
 * @param {number=} delay
 * @returns {(...args: unknown[]) => void}
 */
export function debounce(fn, delay = 300) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
