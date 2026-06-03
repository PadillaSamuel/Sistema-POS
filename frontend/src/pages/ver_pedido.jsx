import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Ban, Printer, Receipt } from 'lucide-react'
import { useReactToPrint } from 'react-to-print'
import { toast } from 'react-toastify'

import { apiRequest } from '../services/api'
import { formateador } from '../lib/format'
import FilaPedido from '../components/fila_pedido'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

const METODOS = [
  { key: 'EFECTIVO', label: 'Efectivo' },
  { key: 'TRANSFERENCIA', label: 'Transferencia' },
  { key: 'DATAFONO', label: 'Datáfono' },
]

const VerPedido = () => {
  const { id, mesa, estado, domi } = useParams()
  const [pedido, setPedido] = useState([])
  const [total, setTotal] = useState(0)
  const [celular, setCelular] = useState(null)
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false)
  const [pagoMetodos, setPagoMetodos] = useState({
    EFECTIVO: '',
    TRANSFERENCIA: '',
    DATAFONO: '',
  })
  const comandaRef = useRef()
  const navigate = useNavigate()
  const esResuelto = estado !== undefined

  useEffect(() => {
    const traerPedido = async () => {
      const tmp = await apiRequest(`/api/detallePedido/${id}`, { metodo: 'GET' })
      setPedido(tmp)
      const suma = tmp.reduce((cnt, p) => cnt + p.subtotalPedido, 0)
      setTotal(suma)
    }
    traerPedido()
  }, [id])

  useEffect(() => {
    const cargarCel = async () => {
      const ruta = esResuelto ? '/api/pedidos/resueltos' : '/api/pedidos/listar'
      const pediList = await apiRequest(ruta, { metodo: 'GET' })
      const pedidoCel = pediList?.find((p) => p.id === Number(id))
      if (pedidoCel?.numeroCliente !== undefined) {
        setCelular(pedidoCel.numeroCliente)
      }
    }
    cargarCel()
  }, [id, esResuelto])

  const handlePagoMetodoChange = (metodo, value) => {
    const numericValue = value.replace(/\D/g, '')
    setPagoMetodos((prev) => ({ ...prev, [metodo]: numericValue }))
  }

  const calcularSumaPagos = () =>
    Object.values(pagoMetodos).reduce((sum, val) => sum + (parseInt(val) || 0), 0)

  const validarYEnviarPagos = async () => {
    const sumaPagos = calcularSumaPagos()

    if (sumaPagos === 0) {
      toast.error('Debe ingresar al menos un método de pago')
      return
    }
    if (sumaPagos !== total) {
      toast.error(
        `La suma de los pagos (${formateador.format(sumaPagos)}) no coincide con el total del pedido (${formateador.format(total)})`
      )
      return
    }

    const pagos = METODOS.flatMap(({ key }) => {
      const monto = parseInt(pagoMetodos[key]) || 0
      return monto > 0 ? [{ metodoPago: key, monto }] : []
    })

    try {
      await apiRequest(`/api/pedidos/pagar/${id}`, { metodo: 'PUT', body: pagos })
      toast.success('Pago procesado correctamente')
      setModalPagoAbierto(false)
      navigate('/pedidos')
    } catch (error) {
      toast.error(`Error al procesar pago: ${error.message}`)
    }
  }

  const abrirModalPago = () => {
    setPagoMetodos({ EFECTIVO: '', TRANSFERENCIA: '', DATAFONO: '' })
    setModalPagoAbierto(true)
  }

  const imprimir = useReactToPrint({ contentRef: comandaRef })

  const imprimirFactura = async (cuerpo) =>
    apiRequest('/api/impresora/factura', { metodo: 'POST', body: cuerpo })

  const impresionFac = async () => {
    await imprimirFactura({
      idPedido: Number(id),
      impresoraIp: import.meta.env.VITE_IMPRESORA_FACTURA || '192.168.1.100',
      numeroMesa: mesa !== undefined ? mesa : null,
      nombreDomicilio: domi !== undefined ? domi : null,
      numeroCliente: celular,
      productos: pedido.map((p) => ({
        nombreProducto: p.nombreProducto,
        cantidadProducto: p.cantidadProducto,
        subtotalPedido: p.subtotalPedido,
        precioMomento: p.precioMomento,
        peticionCliente: p.peticionCliente,
      })),
      total,
    })
  }

  const anularPedido = async () => {
    await apiRequest(`/api/pedidos/actualizar/${id}/CANCELADO/ANULADO`, { metodo: 'PUT' })
    navigate('/pedidos')
  }

  const sumaPagos = calcularSumaPagos()
  const pagosBalanceados = sumaPagos === total && sumaPagos > 0
  const diferencia = Math.abs(total - sumaPagos)

  return (
    <>
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Pedido {id}</h1>
          <p className="text-sm text-muted-foreground">
            {domi !== undefined ? `Domicilio: ${domi}` : `Mesa N.${mesa}`}
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Productos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Productos</TableHead>
                  <TableHead className="w-24 text-center">Cantidad</TableHead>
                  <TableHead className="w-32 text-center">Precio</TableHead>
                  <TableHead className="w-32 text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedido.map((p, index) => (
                  <FilaPedido
                    key={index}
                    nombre={p.nombreProducto.charAt(0).toUpperCase() + p.nombreProducto.slice(1)}
                    cantidad={p.cantidadProducto}
                    precio={formateador.format(p.precioMomento)}
                    subtotal={formateador.format(p.subtotalPedido)}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t pt-4">
            <span className="text-base font-medium">Total</span>
            <span className="text-lg font-bold tabular-nums">{formateador.format(total)}</span>
          </CardFooter>
        </Card>

        <div className="flex flex-wrap justify-end gap-2">
          {esResuelto ? (
            <Button onClick={impresionFac}>
              <Printer className="h-5 w-5" aria-hidden="true" />
              <span>Imprimir Comanda</span>
            </Button>
          ) : (
            <>
              <Button variant="destructive" onClick={anularPedido}>
                <Ban className="h-5 w-5" aria-hidden="true" />
                <span>Anular pedido</span>
              </Button>
              <Button onClick={abrirModalPago}>
                <Receipt className="h-5 w-5" aria-hidden="true" />
                <span>Confirmar pago</span>
              </Button>
              <Button variant="outline" onClick={impresionFac}>
                <Printer className="h-5 w-5" aria-hidden="true" />
                <span>Imprimir Comanda</span>
              </Button>
            </>
          )}
        </div>
      </section>

      <Dialog open={modalPagoAbierto} onOpenChange={setModalPagoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar pago</DialogTitle>
            <DialogDescription>
              Ingresa el monto recibido por cada método de pago. La suma debe
              coincidir con el total del pedido.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {METODOS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
                <Label htmlFor={`pago-${key}`} className="text-sm font-semibold">
                  {label.toUpperCase()}
                </Label>
                <Input
                  id={`pago-${key}`}
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={pagoMetodos[key]}
                  onChange={(e) => handlePagoMetodoChange(key, e.target.value)}
                  className="w-32 text-right"
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total del pedido</span>
              <span className="font-medium tabular-nums">{formateador.format(total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pago</span>
              <span
                className={cn(
                  'font-medium tabular-nums',
                  pagosBalanceados ? 'text-primary' : 'text-foreground'
                )}
              >
                {formateador.format(sumaPagos)}
              </span>
            </div>
            {sumaPagos > 0 && !pagosBalanceados && (
              <div
                className={cn(
                  'flex items-center justify-between text-xs',
                  sumaPagos > total ? 'text-destructive' : 'text-destructive'
                )}
              >
                <span>{sumaPagos > total ? 'Exceso' : 'Faltante'}</span>
                <span className="tabular-nums">{formateador.format(diferencia)}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPagoAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={validarYEnviarPagos}>Confirmar pago</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div ref={comandaRef} className="hidden print:block">
        <h2>Pedido {id}</h2>
        <p>{domi !== undefined ? `Domicilio: ${domi}` : `Mesa N.${mesa}`}</p>
        <ul>
          {pedido.map((p, i) => (
            <li key={i}>
              {p.cantidadProducto} x {p.nombreProducto} = {formateador.format(p.subtotalPedido)}
            </li>
          ))}
        </ul>
        <p>Total: {formateador.format(total)}</p>
      </div>
    </>
  )
}

export default VerPedido
