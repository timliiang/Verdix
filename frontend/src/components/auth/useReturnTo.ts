import { useLocation, type Location } from "react-router-dom"

// Where a user goes once signed in: the page ProtectedRoute bounced them from, otherwise home.
// Read from router state, not a ?redirect= query param, so only the app itself can set it and it
// cannot be abused as an open redirect.
export function useReturnTo(): Location | string {
  const state = useLocation().state as { from?: Location } | null
  return state?.from ?? "/"
}
