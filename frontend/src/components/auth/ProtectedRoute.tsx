import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

// A pathless layout route that gates its children: signed in renders the matched child through
// <Outlet />, signed out redirects to /login. The attempted location rides along in router state
// so LoginPage can send the user back to it, and replace keeps /login from trapping the Back button.
export function ProtectedRoute() {
  const { token } = useAuth()
  const location = useLocation()

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}
