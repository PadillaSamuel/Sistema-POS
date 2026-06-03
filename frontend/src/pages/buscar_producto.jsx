import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Search, Trash2 } from 'lucide-react'

import { apiRequest } from '../services/api'
import { formateador } from '../lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
          <Table containerClassName="max-h-[60vh]">
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
                          aria-label={`Eliminar ${p.nombreProducto}`}
                          disabled
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
        </CardContent>
      </Card>
    </section>
  )
}

export default BuscarProducto
