import { useMemo } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'

import Sidebar from '@/components/sidebar'

export const leerUsuario = () => {
  const token = localStorage.getItem('token')
  const rol = localStorage.getItem('rol') || ''
  const nombreGuardado = localStorage.getItem('nombreUsuario') || ''

  if (!token) {
    return { token: null, rol, nombre: '' }
  }

  let nombre = nombreGuardado
  if (!nombre) {
    try {
      const decoded = jwtDecode(token)
      nombre = decoded?.sub || ''
    } catch {
      nombre = ''
    }
  }

  return { token, rol, nombre }
}

const AuthenticatedLayout = () => {
  const navigate = useNavigate()
  const usuario = useMemo(() => leerUsuario(), [])

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('rol')
    localStorage.removeItem('nombreUsuario')
    toast.info('Sesión cerrada')
    navigate('/', { replace: true })
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar usuario={usuario} alCerrarSesion={cerrarSesion} />
      <main
        id="main-content"
        className="flex-1 overflow-y-auto"
        aria-label="Contenido principal"
      >
        <Outlet context={{ usuario }} />
      </main>
    </div>
  )
}

export default AuthenticatedLayout
