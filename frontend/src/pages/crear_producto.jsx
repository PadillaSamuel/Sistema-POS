import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'react-toastify'

import { apiRequest } from '../services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CrearProducto = () => {
  const { id, nombre: nombreParam, precio: precioParam } = useParams()
  const navigate = useNavigate()
  const enEdicion = id !== undefined
  const [cargando, setCargando] = useState(false)

  const enviarProducto = async (cuerpo) => {
    return apiRequest('/api/producto/crear', {
      metodo: 'POST',
      body: cuerpo,
    })
  }

  const actualizarProducto = async (cuerpo) => {
    return apiRequest(`/api/producto/actualizar/${id}`, {
      metodo: 'PUT',
      body: cuerpo,
    })
  }

  const volverAtras = () => {
    navigate('/caja')
  }

  const capturarDatos = async (e) => {
    e.preventDefault()
    if (cargando) return

    const form = e.currentTarget
    const datos = {
      nombreProducto: form.nombrePizza.value.trim(),
      precioProducto: form.precioPizza.value.trim(),
      combinable: form.estado.value,
      activo: true,
    }

    if (!datos.nombreProducto) {
      toast.error('Ingrese el nombre del producto')
      return
    }
    if (!datos.precioProducto || Number.isNaN(Number(datos.precioProducto))) {
      toast.error('Ingrese un precio válido')
      return
    }

    setCargando(true)
    try {
      if (enEdicion) {
        await actualizarProducto(datos)
        toast.success('¡Producto actualizado con éxito!')
      } else {
        await enviarProducto(datos)
        toast.success('¡Producto creado con éxito!')
      }
      navigate('/caja')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <section className="flex min-h-full w-full flex-col items-center justify-center gap-4 p-6">
      <div className="flex w-full max-w-md flex-col gap-4">
      <header className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={volverAtras}
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {enEdicion ? 'Editar producto' : 'Nuevo producto'}
        </h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del producto</CardTitle>
        </CardHeader>
        <form onSubmit={capturarDatos} noValidate>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombrePizza">Nombre del producto</Label>
              <Input
                id="nombrePizza"
                name="nombrePizza"
                type="text"
                required
                defaultValue={nombreParam}
                placeholder="Ej. Pizza familiar"
                disabled={cargando}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="precioPizza">Precio del producto</Label>
              <Input
                id="precioPizza"
                name="precioPizza"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                required
                defaultValue={precioParam}
                placeholder="0"
                disabled={cargando}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="estado">Tipo</Label>
              <Select name="estado" defaultValue="true" disabled={cargando}>
                <SelectTrigger id="estado" name="estado">
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Combinable</SelectItem>
                  <SelectItem value="false">Completa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={cargando}>
              <Save className="h-5 w-5" aria-hidden="true" />
              <span>{cargando ? 'Guardando…' : enEdicion ? 'Actualizar' : 'Guardar'}</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
      </div>
    </section>
  )
}

export default CrearProducto
