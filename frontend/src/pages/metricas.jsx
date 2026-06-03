import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Loader2, Printer, Search } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Pie, PieChart } from 'recharts'
import { toast } from 'react-toastify'

import { apiRequest } from '../services/api'
import { formateador } from '../lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { DatePicker } from '@/components/ui/date-picker'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { addDays, format } from 'date-fns'

const COLORS = {
  EFECTIVO: 'hsl(130 70% 45%)',
  TRANSFERENCIA: 'hsl(217 91% 60%)',
  DATAFONO: 'hsl(280 65% 60%)',
}

const COLOR_CANTIDAD = 'hsl(130 70% 45%)'

const MESES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

// En el backend (PedidoServiceImpl) se usa metodoPago.ordinal():
// 0 = EFECTIVO, 1 = TRANSFERENCIA, 2 = DATAFONO.
const METODOS_POR_ORDINAL = ['EFECTIVO', 'TRANSFERENCIA', 'DATAFONO']

const configPagos = {
  EFECTIVO: { label: 'Efectivo', color: COLORS.EFECTIVO },
  TRANSFERENCIA: { label: 'Transferencia', color: COLORS.TRANSFERENCIA },
  DATAFONO: { label: 'Datáfono', color: COLORS.DATAFONO },
}

const configCantidad = {
  cantidad: { label: 'Pedidos', color: COLOR_CANTIDAD },
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
  const [imprimiendoCierre, setImprimiendoCierre] = useState(false)

  const anhoPorDefecto = useMemo(() => new Date().getFullYear(), [])
  const [anho, setAnho] = useState(anhoPorDefecto)
  const [metricaAnual, setMetricaAnual] = useState(null)
  const [cargandoAnual, setCargandoAnual] = useState(false)

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
      toast.error('Selecciona ambas fechas (desde y hasta)')
      return
    }
    if (rango.from > rango.to) {
      toast.error('La fecha "desde" no puede ser mayor que "hasta"')
      return
    }
    setRangoAplicado(rango)
  }

  const imprimirCierre = async () => {
    if (imprimiendoCierre) return
    setImprimiendoCierre(true)
    try {
      await apiRequest('/api/impresora/cierre', {
        metodo: 'POST',
        body: {
          impresoraIp:
            import.meta.env.VITE_IMPRESORA_FACTURA || '192.168.1.100',
        },
      })
      toast.success('Cierre de día impreso correctamente')
    } catch (err) {
      const msj = String(err?.message || err)
      if (msj.includes('404')) {
        toast.info('No hay pedidos resueltos hoy para imprimir')
      } else {
        toast.error(msj)
      }
    } finally {
      setImprimiendoCierre(false)
    }
  }

  const cargarAnual = async () => {
    if (cargandoAnual) return
    setCargandoAnual(true)
    try {
      const res = await apiRequest(`/api/metricas/anhos/${anho}`, { metodo: 'GET' })
      setMetricaAnual(res)
    } catch (err) {
      const msj = String(err?.message || err)
      if (msj.includes('404')) {
        setMetricaAnual(null)
        toast.info(`No hay métricas para el año ${anho}`)
      } else {
        toast.error(msj)
      }
    } finally {
      setCargandoAnual(false)
    }
  }

  const dataCantidad = useMemo(
    () =>
      MESES.map((nombre, i) => ({
        mes: nombre,
        cantidad: metricaAnual?.pedidosMeses?.[i + 1] ?? 0,
      })),
    [metricaAnual]
  )

  const dataPagos = useMemo(
    () =>
      MESES.map((nombre, i) => {
        const inner = metricaAnual?.pagosMeses?.[i + 1] || {}
        return {
          mes: nombre,
          EFECTIVO: inner[0] ?? 0,
          TRANSFERENCIA: inner[1] ?? 0,
          DATAFONO: inner[2] ?? 0,
        }
      }),
    [metricaAnual]
  )

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
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="metricas-desde">Desde</Label>
              <DatePicker
                value={rango.from}
                onChange={(d) => setRango((prev) => ({ ...prev, from: d }))}
                placeholder="Fecha inicial"
                ariaLabel="Fecha inicial"
                toDate={rango.to}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="metricas-hasta">Hasta</Label>
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
        <CardFooter className="flex flex-col gap-3 border-t text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
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
          </div>
          <Button
            variant="outline"
            onClick={imprimirCierre}
            disabled={imprimiendoCierre}
            aria-busy={imprimiendoCierre}
          >
            {imprimiendoCierre ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Printer className="h-5 w-5" aria-hidden="true" />
            )}
            <span>{imprimiendoCierre ? 'Imprimiendo…' : 'Imprimir cierre de día'}</span>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Métricas anuales</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh]">
            <div className="flex flex-col gap-6 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-1.5 sm:w-40">
                  <Label htmlFor="metrica-anho">Año</Label>
                  <Input
                    id="metrica-anho"
                    type="number"
                    inputMode="numeric"
                    min="2000"
                    max="2100"
                    value={anho}
                    onChange={(e) =>
                      setAnho(Number(e.target.value) || anhoPorDefecto)
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') cargarAnual()
                    }}
                  />
                </div>
                <Button
                  onClick={cargarAnual}
                  disabled={cargandoAnual}
                  aria-busy={cargandoAnual}
                >
                  {cargandoAnual ? (
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <BarChart3 className="h-5 w-5" aria-hidden="true" />
                  )}
                  <span>{cargandoAnual ? 'Cargando…' : 'Aplicar'}</span>
                </Button>
              </div>

              {!cargandoAnual && metricaAnual === null && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Sin datos para mostrar. Selecciona un año y pulsa Aplicar.
                </p>
              )}

              {metricaAnual && (
                <>
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">Cantidad de pedidos por mes</h3>
                    <ChartContainer
                      config={configCantidad}
                      className="h-[260px] w-full"
                    >
                      <BarChart data={dataCantidad}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="mes"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel nameKey="mes" />}
                        />
                        <Bar
                          dataKey="cantidad"
                          fill={COLOR_CANTIDAD}
                          radius={4}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold">
                      Monto de pagos por método (apilado)
                    </h3>
                    <ChartContainer
                      config={configPagos}
                      className="h-[280px] w-full"
                    >
                      <BarChart data={dataPagos}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="mes"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => formateador.format(v)}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel nameKey="mes" />}
                          formatter={(v) => formateador.format(v)}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                          dataKey="EFECTIVO"
                          stackId="pagos"
                          fill={COLORS.EFECTIVO}
                        />
                        <Bar
                          dataKey="TRANSFERENCIA"
                          stackId="pagos"
                          fill={COLORS.TRANSFERENCIA}
                        />
                        <Bar
                          dataKey="DATAFONO"
                          stackId="pagos"
                          fill={COLORS.DATAFONO}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  )
}

export default Metricas
