import { useCallback, useSyncExternalStore } from "react"

// Subscribes to a CSS media query. useSyncExternalStore, not useState + useEffect, so the very first
// render already has the right answer: the filter panel never flashes in its mobile form on desktop.
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}
