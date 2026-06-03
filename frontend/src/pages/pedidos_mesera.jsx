import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Receipt } from 'lucide-react'

import { apiRequest } from '../services/api'
import BotonPedido from '../components/boton_pedido'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PedidoMesera = () => {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])

  const traerPedidos = () => apiRequest('/api/pedidos/listar', { metodo: 'GET' })

  useEffect(() => {
    const mostrar = async () => {
      const tmp = await traerPedidos()
      setPedidos(tmp)
    }
    mostrar()
    const intervalo = setInterval(async () => {
      const res = await traerPedidos()
      setPedidos(res)
    }, 10000)
    return () => clearInterval(intervalo)
  }, [])

  const items = pedidos
    .filter((p) => p.numeroMesa !== 0)
    .map((p) => (
      <BotonPedido
        key={p.id}
        num_mesa={p.numeroMesa}
        num_pedido={p.id}
        ruta={`/tomar-pedido/${p.id}/${p.numeroMesa}`}
      />
    ))

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Receipt className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Mis pedidos</h1>
        </div>
        <Button onClick={() => navigate('/tomar-pedido')}>
          <Plus className="h-5 w-5" aria-hidden="true" />
          <span>Nuevo pedido</span>
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pedidos en mesa</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No hay pedidos en curso
            </p>
          ) : (
            items
          )}
        </CardContent>
      </Card>
    </section>
  )
}

export default PedidoMesera
