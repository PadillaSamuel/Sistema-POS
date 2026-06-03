import { useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'

import { autenticar } from '../services/autenticacion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import loginImg from '../assets/artesanos_logo.jpg'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const Login = () => {
  const navigate = useNavigate()
  const usuarioId = useId()
  const contrasenaId = useId()
  const errorId = useId()

  const [cargando, setCargando] = useState(false)
  const [errores, setErrores] = useState({})

  const validar = (datos) => {
    const nuevos = {}

    const usuario = datos.nombreUsuario.trim()
    if (!usuario) {
      nuevos.nombreUsuario = 'Por favor, ingrese su nombre de usuario.'
    } else if (EMAIL_REGEX.test(usuario)) {
      nuevos.nombreUsuario = 'Ingrese su nombre de usuario, no un correo electrónico.'
    }

    if (!datos.contrasena) {
      nuevos.contrasena = 'Por favor, ingrese su contraseña.'
    }

    return nuevos
  }

  const loguearse = async (e) => {
    e.preventDefault()
    if (cargando) return

    const form = e.currentTarget
    const datos = {
      nombreUsuario: form.nombreUsuario.value,
      contrasena: form.contrasena.value,
    }

    const nuevosErrores = validar(datos)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) {
      const firstField = nuevosErrores.nombreUsuario ? usuarioId : contrasenaId
      document.getElementById(firstField)?.focus()
      return
    }

    setCargando(true)
    try {
      const res = await autenticar({
        nombreUsuario: datos.nombreUsuario.trim(),
        contrasena: datos.contrasena,
      })

      if (!res || !res.token) {
        throw new Error('No se recibió un token válido.')
      }

      localStorage.setItem('token', res.token)
      localStorage.setItem('rol', res.rol || '')

      let nombre = ''
      try {
        const decoded = jwtDecode(res.token)
        nombre = decoded?.sub || ''
      } catch {
        nombre = ''
      }
      if (nombre) localStorage.setItem('nombreUsuario', nombre)

      toast.success('¡Bienvenido de nuevo!')

      const destino =
        res.rol === 'ROLE_CAJA' ? '/caja'
        : res.rol === 'ROLE_MESERA' ? '/mesera'
        : '/'

      navigate(destino, { replace: true })
    } catch (error) {
      setErrores({ _form: error?.message || 'No fue posible iniciar sesión. Intente de nuevo.' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <main
      id="main-content"
      className="flex min-h-screen w-full items-center justify-center px-4 py-10"
      aria-labelledby="login-titulo"
    >
      <Card className="w-full max-w-md border-border/60 bg-card shadow-lg">
        <CardHeader className="items-center gap-3 pb-2 text-center">
          <img
            src={loginImg}
            alt="Logo de Artesanos Pizzería"
            className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/30"
            width={80}
            height={80}
          />
          <CardTitle id="login-titulo" className="text-2xl font-bold text-primary">
            Iniciar sesión
          </CardTitle>
          <CardDescription>
            Ingrese sus credenciales para acceder al sistema.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={loguearse} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={usuarioId}>Nombre de usuario</Label>
              <Input
                id={usuarioId}
                name="nombreUsuario"
                type="text"
                autoComplete="username"
                placeholder="Ingrese su nombre"
                required
                aria-invalid={Boolean(errores.nombreUsuario)}
                aria-describedby={errores.nombreUsuario ? `${usuarioId}-error` : undefined}
                disabled={cargando}
              />
              {errores.nombreUsuario && (
                <p id={`${usuarioId}-error`} role="alert" className="text-sm text-destructive">
                  {errores.nombreUsuario}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor={contrasenaId}>Contraseña</Label>
              <Input
                id={contrasenaId}
                name="contrasena"
                type="password"
                autoComplete="current-password"
                placeholder="Ingrese su contraseña"
                required
                aria-invalid={Boolean(errores.contrasena)}
                aria-describedby={errores.contrasena ? `${contrasenaId}-error` : undefined}
                disabled={cargando}
              />
              {errores.contrasena && (
                <p id={`${contrasenaId}-error`} role="alert" className="text-sm text-destructive">
                  {errores.contrasena}
                </p>
              )}
            </div>

            {errores._form && (
              <p
                id={errorId}
                role="alert"
                aria-live="assertive"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {errores._form}
              </p>
            )}

            <Button
              type="submit"
              className="mt-2 h-11 w-full text-base font-semibold"
              disabled={cargando}
              aria-busy={cargando}
            >
              {cargando ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  <span>Cargando…</span>
                </>
              ) : (
                <span>Iniciar</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}

export default Login
