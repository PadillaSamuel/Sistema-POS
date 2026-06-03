import { Navigate, Outlet, useLocation } from 'react-router-dom'

const RequireAuth = () => {
  const token = localStorage.getItem('token')
  const location = useLocation()

  if (!token) {
    return <Navigate to="/" replace state={{ desde: location.pathname }} />
  }

  return <Outlet />
}

export default RequireAuth
