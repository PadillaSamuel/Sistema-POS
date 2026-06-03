import { useEffect, useState } from 'react'
import { ArchiveX } from 'lucide-react'

import { apiRequest } from '../services/api'
import BotonPedido from '../components/boton_pedido'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

const Anulados = () => {
  const [pedidos, setPedidos] = useState([])

  const traerAnulados = () => apiRequest('/api/pedidos/anulados', { metodo: 'GET' })

  useEffect(() => {
    const cargar = async () => {
      const anul = await traerAnulados()
      setPedidos(anul)
    }
    cargar()
  }, [])

  const items = (pedidos || []).map((p) =>
    p.numeroMesa === 0 ? (
      <BotonPedido
        key={p.id}
        ruta={`/ver-pedido-domi/${p.id}/${p.nombreDomicilio}/resuelto`}
        nombreDomi={p.nombreDomicilio}
        num_pedido={p.id}
      />
    ) : (
      <BotonPedido
        key={p.id}
        ruta={`/ver-pedido/${p.id}/${p.numeroMesa}/resuelto`}
        num_mesa={p.numeroMesa}
        num_pedido={p.id}
      />
    )
  )

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <header className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md bg-destructive/10 text-destructive"
          aria-hidden="true"
        >
          <ArchiveX className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Pedidos anulados</h1>
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
                  No existen pedidos anulados
                </p>
              ) : (
                items
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  )
}

export default Anulados
