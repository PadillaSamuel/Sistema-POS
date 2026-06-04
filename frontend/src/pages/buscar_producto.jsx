import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Search, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

import { apiRequest } from '../services/api'
import { formateador } from '../lib/format'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const BuscarProducto = () => {
  const navigate = useNavigate()
  const [dato, setDato] = useState('')
  const [pizzas, setPizzas] = useState([])
  const [productoAEliminar, setProductoAEliminar] = useState(null)
  const [desactivando, setDesactivando] = useState(false)

  useEffect(() => {
    if (dato === '') {
      setPizzas([])
      return
    }
    let cancelado = false
    const traer = async () => {
      try {
        const tmp = await apiRequest(`/api/producto/listar/${dato}`, {
          metodo: 'GET',
        })
        if (!cancelado) setPizzas(Array.isArray(tmp) ? tmp : [])
      } catch {
        if (!cancelado) setPizzas([])
      }
    }
    traer()
    return () => {
      cancelado = true
    }
  }, [dato])

  const confirmarDesactivacion = async () => {
    if (!productoAEliminar || desactivando) return
    setDesactivando(true)
    try {
      await apiRequest(`/api/producto/desactivar/${productoAEliminar.id}`, {
        metodo: 'PUT',
      })
      toast.success('Producto desactivado')
      setPizzas((prev) => prev.filter((p) => p.id !== productoAEliminar.id))
      setProductoAEliminar(null)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setDesactivando(false)
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
      <header className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => navigate('/caja')}
          aria-label="Volver"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Buscar producto</h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtro de búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="text"
              name="buscador"
              value={dato}
              onChange={(e) => setDato(e.target.value)}
              placeholder="Ingrese un nombre o parte del nombre"
              className="pl-10"
              autoComplete="off"
              aria-label="Buscar producto"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20 text-center">ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-32 text-center">Precio</TableHead>
                  <TableHead className="w-24 text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dato === '' ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Escribe en el buscador para listar productos.
                    </TableCell>
                  </TableRow>
                ) : pizzas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      No hay productos que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                ) : (
                  pizzas.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-center font-mono text-xs">{p.id}</TableCell>
                      <TableCell>
                        {p.nombreProducto.charAt(0).toUpperCase() + p.nombreProducto.slice(1)}
                      </TableCell>
                      <TableCell className="text-center tabular-nums">
                        {formateador.format(p.precio)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              navigate(`/editar-producto/${p.id}/${p.nombreProducto}/${p.precio}`)
                            }
                            aria-label={`Editar ${p.nombreProducto}`}
                          >
                            <Pencil className="h-5 w-5" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setProductoAEliminar(p)}
                            aria-label={`Eliminar ${p.nombreProducto}`}
                          >
                            <Trash2 className="h-5 w-5" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog
        open={productoAEliminar !== null}
        onOpenChange={(open) => {
          if (!open && !desactivando) setProductoAEliminar(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desactivar producto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Desactivar el producto{' '}
              <span className="font-semibold text-foreground">
                &quot;{productoAEliminar?.nombreProducto}&quot;
              </span>
              ? Seguirá en la base de datos para mantener la trazabilidad de los
              pedidos. No se podrá volver a activar desde la aplicación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={desactivando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                confirmarDesactivacion()
              }}
              disabled={desactivando}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {desactivando ? 'Desactivando…' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}

export default BuscarProducto
