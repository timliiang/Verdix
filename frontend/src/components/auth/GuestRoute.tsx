import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { useReturnTo } from "./useReturnTo"

// ProtectedRoute's mirror, for screens that only make sense signed out (log in, register): signed out
// renders the child, signed in redirects away. It sends the user to the same place LoginPage does
// after a successful login, so whichever of the two redirects runs first, they agree.
export function GuestRoute() {
  const { token } = useAuth()
  const returnTo = useReturnTo()

  if (token) return <Navigate to={returnTo} replace />

  return <Outlet />
}
