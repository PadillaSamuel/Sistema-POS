import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Search } from 'lucide-react'
import { Pie, PieChart } from 'recharts'
import { toast } from 'react-toastify'

import { apiRequest } from '../services/api'
import { formateador } from '../lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { addDays, format } from 'date-fns'

const COLORS = {
  EFECTIVO: 'hsl(130 70% 45%)',
  TRANSFERENCIA: 'hsl(217 91% 60%)',
  DATAFONO: 'hsl(280 65% 60%)',
}

const aIso = (fecha) => (fecha ? format(fecha, 'yyyy-MM-dd') : '')

const formatearCorto = (fecha) => (fecha ? format(fecha, 'dd/MM/yyyy') : '')

const Metricas = () => {
  const hoy = useMemo(() => new Date(), [])
  const inicioPorDefecto = useMemo(() => addDays(hoy, -30), [hoy])

  const [rango, setRango] = useState({ from: inicioPorDefecto, to: hoy })
  const [rangoAplicado, setRangoAplicado] = useState({ from: inicioPorDefecto, to: hoy })
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(false)

  const traer = async (inicio, fin) => {
    try {
      const response = await apiRequest(
        `/api/pedidos/resueltos/cierre/pagos/${inicio}/${fin}`,
        { metodo: 'GET' }
      )
      return Array.isArray(response) ? response : []
    } catch (err) {
      const msj = String(err?.message || err)
      if (msj.includes('404')) return []
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
        setPedidos(res)
      } catch {
        toast.error('¡Error al cargar las ventas!')
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

  const totalesPorMetodo = useMemo(() => {
    const totales = { EFECTIVO: 0, TRANSFERENCIA: 0, DATAFONO: 0 }
    pedidos.forEach((p) => {
      ;(p.pagos || []).forEach((pago) => {
        if (totales[pago.metodoPago] !== undefined) {
          totales[pago.metodoPago] += pago.monto || 0
        }
      })
    })
    return totales
  }, [pedidos])

  const totalGeneral = useMemo(
    () => Object.values(totalesPorMetodo).reduce((s, v) => s + v, 0),
    [totalesPorMetodo]
  )

  const datosGrafica = useMemo(
    () => [
      { metodo: 'EFECTIVO', monto: totalesPorMetodo.EFECTIVO, fill: COLORS.EFECTIVO },
      { metodo: 'TRANSFERENCIA', monto: totalesPorMetodo.TRANSFERENCIA, fill: COLORS.TRANSFERENCIA },
      { metodo: 'DATAFONO', monto: totalesPorMetodo.DATAFONO, fill: COLORS.DATAFONO },
    ],
    [totalesPorMetodo]
  )

  const config = {
    EFECTIVO: { label: 'Efectivo', color: COLORS.EFECTIVO },
    TRANSFERENCIA: { label: 'Transferencia', color: COLORS.TRANSFERENCIA },
    DATAFONO: { label: 'Datáfono', color: COLORS.DATAFONO },
  }

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, metodo }) => {
    if (percent === 0) return null
    const RAD = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6
    const x = cx + radius * Math.cos(-midAngle * RAD)
    const y = cy + radius * Math.sin(-midAngle * RAD)
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-6">
      <header className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Métricas</h1>
          <p className="text-sm text-muted-foreground">
            Distribución de pagos por método en el rango seleccionado.
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
              <DateRangePicker
                value={rango}
                onChange={setRango}
                placeholder="Selecciona el rango"
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
          <CardTitle className="text-base">Distribución de pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {totalGeneral === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No hay pagos registrados en el rango seleccionado.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start">
              <ChartContainer
                config={config}
                className="mx-auto aspect-square h-[260px] w-full max-w-[320px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="metodo" />}
                  />
                  <Pie
                    data={datosGrafica}
                    dataKey="monto"
                    nameKey="metodo"
                    innerRadius={60}
                    strokeWidth={5}
                    label={renderLabel}
                    labelLine={false}
                  />
                </PieChart>
              </ChartContainer>

              <div className="flex w-full flex-col gap-3 lg:flex-1">
                {datosGrafica.map((d) => (
                  <div
                    key={d.metodo}
                    className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-3 w-3 rounded-sm"
                        style={{ backgroundColor: d.fill }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium">
                        {config[d.metodo].label}
                      </span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {formateador.format(d.monto)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-md border-2 border-primary/20 bg-primary/5 px-3 py-2">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-base font-bold tabular-nums">
                    {formateador.format(totalGeneral)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-1 border-t text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="font-medium text-foreground">{pedidos.length}</span>{' '}
            {pedidos.length === 1 ? 'pedido traído' : 'pedidos traídos'}
          </span>
          <span>
            Rango:{' '}
            <span className="font-medium text-foreground">
              {formatearCorto(rangoAplicado.from)} → {formatearCorto(rangoAplicado.to)}
            </span>
          </span>
        </CardFooter>
      </Card>
    </section>
  )
}

export default Metricas
