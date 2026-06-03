import { Navigate, Outlet, useLocation } from 'react-router-dom'

export const HOME_POR_ROL = {
  ROLE_CAJA: '/caja',
  ROLE_MESERA: '/mesera',
}

const RequireRol = ({ roles }) => {
  const rol = localStorage.getItem('rol')
  const location = useLocation()

  if (!rol) {
    return <Navigate to="/" replace state={{ desde: location.pathname }} />
  }

  if (Array.isArray(roles) && roles.length > 0 && !roles.includes(rol)) {
    return <Navigate to={HOME_POR_ROL[rol] || '/'} replace />
  }

  return <Outlet />
}

export default RequireRol
