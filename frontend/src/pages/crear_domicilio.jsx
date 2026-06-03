import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Bike, User } from 'lucide-react'
import { toast } from 'react-toastify'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const CARACTERES_INVALIDOS = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s'-]/g

const limpiar = (val) => (val || '').replace(CARACTERES_INVALIDOS, '')

const NOMBRE_MIN = 2
const NOMBRE_MAX = 80
const CEL_REGEX = /^[0-9+\-\s()]*$/

const CrearDomicilio = () => {
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [celular, setCelular] = useState('')
  const [errores, setErrores] = useState({})

  const cambiarNombre = (e) => {
    const v = e.target.value
    const limpio = limpiar(v)
    if (limpio !== v) {
      setErrores((prev) => ({
        ...prev,
        nombre: 'Solo se permiten letras, números, espacios, apóstrofes y guiones.',
      }))
    } else {
      setErrores((prev) => {
        const { nombre: _omit, ...rest } = prev
        return rest
      })
    }
    setNombre(limpio)
  }

  const cambiarCelular = (e) => {
    const v = e.target.value
    if (!CEL_REGEX.test(v) && v !== '') {
      setErrores((prev) => ({
        ...prev,
        celular: 'Solo dígitos, espacios, +, - y ().',
      }))
      return
    }
    setErrores((prev) => {
      const { celular: _omit, ...rest } = prev
      return rest
    })
    setCelular(v)
  }

  const validar = () => {
    const nuevos = {}

    const nombreLimpio = nombre.trim()
    if (!nombreLimpio) {
      nuevos.nombre = 'Ingresa el nombre del cliente.'
    } else if (nombreLimpio.length < NOMBRE_MIN) {
      nuevos.nombre = `El nombre debe tener al menos ${NOMBRE_MIN} caracteres.`
    } else if (nombreLimpio.length > NOMBRE_MAX) {
      nuevos.nombre = `El nombre no puede tener más de ${NOMBRE_MAX} caracteres.`
    } else if (CARACTERES_INVALIDOS.test(nombreLimpio)) {
      nuevos.nombre = 'No se permiten caracteres especiales.'
    }

    if (celular.trim() && !CEL_REGEX.test(celular.trim())) {
      nuevos.celular = 'Formato de celular inválido.'
    }

    setErrores(nuevos)
    return Object.keys(nuevos).length === 0
  }

  const manejarEnvio = (e) => {
    e.preventDefault()
    if (!validar()) {
      toast.error('Revisa los campos del formulario')
      return
    }
    navigate('/tomar-pedido/true', {
      state: {
        nombreDomicilio: nombre.trim(),
        celCliente: celular.trim() || null,
      },
    })
  }

  return (
    <section className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center gap-4 p-6">
      <div className="flex w-full flex-col gap-4">
        <header className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Bike className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Crear domicilio</h1>
            <p className="text-sm text-muted-foreground">
              Empieza un nuevo pedido a domicilio. Luego podrás añadir los productos.
            </p>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del cliente</CardTitle>
          </CardHeader>
          <form onSubmit={manejarEnvio} noValidate>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombre">
                  <span className="flex items-center gap-1.5">
                    <User className="h-4 w-4" aria-hidden="true" />
                    Nombre del cliente
                  </span>
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  type="text"
                  value={nombre}
                  onChange={cambiarNombre}
                  placeholder="Ej. Juan Pérez"
                  required
                  minLength={NOMBRE_MIN}
                  maxLength={NOMBRE_MAX}
                  aria-invalid={Boolean(errores.nombre)}
                  aria-describedby={errores.nombre ? 'nombre-error' : undefined}
                  autoFocus
                />
                {errores.nombre && (
                  <p id="nombre-error" role="alert" className="text-sm text-destructive">
                    {errores.nombre}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Solo letras, números, espacios, apóstrofes (&apos;) y guiones.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="celular">Celular (opcional)</Label>
                <Input
                  id="celular"
                  name="celular"
                  type="tel"
                  value={celular}
                  onChange={cambiarCelular}
                  placeholder="3001234567"
                  aria-invalid={Boolean(errores.celular)}
                  aria-describedby={errores.celular ? 'celular-error' : undefined}
                />
                {errores.celular && (
                  <p id="celular-error" role="alert" className="text-sm text-destructive">
                    {errores.celular}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                <span>Continuar</span>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </section>
  )
}

export default CrearDomicilio
