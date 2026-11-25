import { useEffect, useState } from "react"

// The value, but only after it has stopped changing for `delay` ms. Each change restarts the
// timer (the effect's cleanup clears the previous one), so a burst of keystrokes produces one
// update, `delay` ms after the last key. That update is what search requests key off.
//
// Debounce, not throttle: throttling would fire every `delay` ms *while* typing, sending requests
// for prefixes the user is about to extend. Debouncing waits for a pause, i.e. for intent.
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])

  return debounced
}
