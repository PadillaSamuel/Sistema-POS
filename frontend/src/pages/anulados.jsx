import { useEffect, useMemo, useState } from 'react'
import { addDays, format } from 'date-fns'
import { ArchiveX, Search } from 'lucide-react'
import { toast } from 'react-toastify'

import { apiRequest } from '../services/api'
import BotonPedido from '../components/boton_pedido'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { DatePicker } from '@/components/ui/date-picker'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'

const aIso = (fecha) => (fecha ? format(fecha, 'yyyy-MM-dd') : '')

const Anulados = () => {
  const hoy = useMemo(() => new Date(), [])
  const inicioPorDefecto = useMemo(() => addDays(hoy, -30), [hoy])

  const [rango, setRango] = useState({ from: inicioPorDefecto, to: hoy })
  const [rangoAplicado, setRangoAplicado] = useState({ from: inicioPorDefecto, to: hoy })
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(false)

  const traerAnulados = async (inicio, fin) => {
    try {
      const res = await apiRequest(`/api/pedidos/anulados/${inicio}/${fin}`, { metodo: 'GET' })
      return res
    } catch (err) {
      const msj = String(err?.message || err)
      if (msj.includes('404')) {
        toast.info('No hay pedidos anulados en el rango seleccionado')
        return []
      }
      toast.error('¡Error al cargar los pedidos anulados!')
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
        const res = await traerAnulados(desde, hasta)
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
      toast.error('Selecciona ambas fechas (desde y hasta)')
      return
    }
    if (rango.from > rango.to) {
      toast.error('La fecha "desde" no puede ser mayor que "hasta"')
      return
    }
    setRangoAplicado(rango)
  }

  const items = pedidos.map((p) =>
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
          <CardTitle className="text-base">Rango de fechas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="anulados-desde">Desde</Label>
              <DatePicker
                value={rango.from}
                onChange={(d) => setRango((prev) => ({ ...prev, from: d }))}
                placeholder="Fecha inicial"
                ariaLabel="Fecha inicial"
                toDate={rango.to}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="anulados-hasta">Hasta</Label>
              <DatePicker
                value={rango.to}
                onChange={(d) => setRango((prev) => ({ ...prev, to: d }))}
                placeholder="Fecha final"
                ariaLabel="Fecha final"
                fromDate={rango.from}
                toDate={new Date(new Date().setHours(23, 59, 59, 999))}
              />
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
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No existen pedidos anulados en el rango seleccionado
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
            {items.length === 1 ? 'pedido anulado traído' : 'pedidos anulados traídos'}
          </span>
        </CardFooter>
      </Card>
    </section>
  )
}

export default Anulados
