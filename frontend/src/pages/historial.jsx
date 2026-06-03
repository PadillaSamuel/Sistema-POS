import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { History, Search } from 'lucide-react'
import { toast } from 'react-toastify'

import { apiRequest } from '../services/api'
import BotonPedido from '../components/boton_pedido'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { ScrollArea } from '@/components/ui/scroll-area'
import { addDays } from 'date-fns'

const aIso = (fecha) => (fecha ? format(fecha, 'yyyy-MM-dd') : '')

const Historial = () => {
  const hoy = useMemo(() => new Date(), [])
  const inicioPorDefecto = useMemo(() => addDays(hoy, -30), [hoy])

  const [rango, setRango] = useState({ from: inicioPorDefecto, to: hoy })
  const [rangoAplicado, setRangoAplicado] = useState({ from: inicioPorDefecto, to: hoy })
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(false)

  const traer = async (inicio, fin) => {
    try {
      const res = await apiRequest(`/api/pedidos/resueltos/cierre/pagos/${inicio}/${fin}`, {
        metodo: 'GET',
      })
      toast.success('Ventas obtenidas')
      return res
    } catch (err) {
      const msj = String(err?.message || err)
      if (msj.includes('404')) {
        toast.info('No se encontraron ventas en ese rango de fechas')
        return []
      }
      toast.error('¡Error al cargar las ventas!')
      throw err
    }
  }

  useEffect(() => {
    const cargar = async () => {
      const desde = aIso(rangoAplicado.from)
      const hasta = aIso(rangoAplicado.to)
      if (!desde || !hasta) return
      setCargando(true)
      try {
        const res = await traer(desde, hasta)
        setPedidos(Array.isArray(res) ? res : [])
      } catch {
        setPedidos([])
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [rangoAplicado])

  const aplicar = () => {
    if (!rango?.from || !rango?.to) {
      toast.error('Selecciona un rango de fechas completo')
      return
    }
    setRangoAplicado(rango)
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
      <header className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <History className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historial de ventas</h1>
          <p className="text-sm text-muted-foreground">
            Pedidos resueltos en el rango seleccionado.
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rango de fechas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <DateRangePicker value={rango} onChange={setRango} placeholder="Selecciona el rango" />
            </div>
            <Button onClick={aplicar} disabled={cargando} className="sm:w-auto">
              <Search className="h-5 w-5" aria-hidden="true" />
              <span>{cargando ? 'Buscando…' : 'Aplicar'}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Listado</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            <div className="flex flex-col gap-2 p-6">
              {pedidos.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay ventas en el rango seleccionado.
                </p>
              ) : (
                pedidos.map((p) =>
                  p.numeroMesa !== 0 ? (
                    <BotonPedido
                      key={p.id}
                      ruta={`/ver-pedido/${p.id}/${p.numeroMesa}/resuelto`}
                      num_mesa={p.numeroMesa}
                      num_pedido={p.id}
                    />
                  ) : (
                    <BotonPedido
                      key={p.id}
                      ruta={`/ver-pedido-domi/${p.id}/${p.nombreDomicilio}/resuelto`}
                      nombreDomi={p.nombreDomicilio}
                      num_pedido={p.id}
                    />
                  )
                )
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  )
}

export default Historial
