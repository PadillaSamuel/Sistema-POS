import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'

import { apiRequest } from '../services/api'
import BotonPedido from '../components/boton_pedido'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const Pedidos = () => {
  const [pedido, setPedido] = useState([])
  const { domis } = useParams()

  const listarPedidos = () => apiRequest('/api/pedidos/listar', { metodo: 'GET' })

  useEffect(() => {
    const cargar = async () => {
      const res = await listarPedidos()
      setPedido(res)
    }
    cargar()
    const intervalo = setInterval(async () => {
      const tmp = await listarPedidos()
      setPedido(tmp)
    }, 5000)
    return () => clearInterval(intervalo)
  }, [])

  const items = pedido
    .filter((p) => (domis !== undefined ? p.numeroMesa === 0 : true))
    .map((p) => {
      if (domis !== undefined) {
        return (
          <BotonPedido
            key={p.id}
            ruta={`/tomar-pedido/domi/${p.id}/${p.nombreDomicilio || 'domicilio'}`}
            nombreDomi={p.nombreDomicilio || 'domicilio'}
            num_pedido={p.id}
          />
        )
      }
      if (p.numeroMesa === 0) {
        return (
          <BotonPedido
            key={p.id}
            ruta={`/ver-pedido/domi/${p.id}/${p.nombreDomicilio || 'domicilio'}`}
            nombreDomi={p.nombreDomicilio || 'domicilio'}
            num_pedido={p.id}
          />
        )
      }
      return (
        <BotonPedido
          key={p.id}
          ruta={`/ver-pedido/${p.id}/${p.numeroMesa}`}
          num_mesa={p.numeroMesa}
          num_pedido={p.id}
        />
      )
    })

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <header className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <ClipboardList className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {domis !== undefined ? 'Domicilios en curso' : 'Pedidos en curso'}
        </h1>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            <div className="flex flex-col gap-2 p-6">
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay pedidos en curso
                </p>
              ) : (
                items
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t text-sm text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{items.length}</span>{' '}
            {items.length === 1 ? 'pedido en curso' : 'pedidos en curso'}
          </span>
        </CardFooter>
      </Card>
    </section>
  )
}

export default Pedidos
