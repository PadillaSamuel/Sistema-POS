import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Plus, Receipt, Search, ShoppingBag, Trash2, User } from 'lucide-react'
import { toast } from 'react-toastify'

import { apiRequest } from '../services/api'
import { formateador } from '../lib/format'
import FilaTomarPedido from '../components/fila_tomar_pedido'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const CARACTERES_INVALIDOS = /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s'-]/g

const limpiarNombre = (val) => (val || '').replace(CARACTERES_INVALIDOS, '')

const ROL = () => localStorage.getItem('rol') || ''

const TomarPedido = () => {
  const { id, mesa, domi } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const rol = ROL()

  const stateDomi = location.state || {}

  const token = localStorage.getItem('token')
  let mesero = ''
  try {
    mesero = jwtDecode(token).sub
  } catch {
    mesero = ''
  }

  const esEdicion = id !== undefined
  const esDomicilio = domi !== undefined

  const [digitado, setDigitado] = useState('')
  const [productos, setProductos] = useState([])
  const [pedido, setPedido] = useState([])
  const [total, setTotal] = useState(0)
  const [mesaPedido, setMesaPedido] = useState(
    esEdicion ? (mesa === 0 ? undefined : mesa) : null
  )
  const [nombreDomicilio, setNombreDomicilio] = useState(() => {
    if (esEdicion) return domi
    return stateDomi.nombreDomicilio ?? null
  })
  const [celCliente, setCelCliente] = useState(() => {
    if (esEdicion) return null
    return stateDomi.celCliente ?? null
  })
  const [busquedaAbierta, setBusquedaAbierta] = useState(false)

  useEffect(() => {
    if (!esEdicion) return
    apiRequest(`/api/detallePedido/${id}`, { metodo: 'GET' }).then(setPedido)
  }, [id, esEdicion])

  useEffect(() => {
    if (!esEdicion || !esDomicilio) return
    apiRequest('/api/pedidos/listar', { metodo: 'GET' }).then((pedis) => {
      const pedi = pedis.find((p) => p.id === Number(id))
      if (pedi) setCelCliente(pedi.numeroCliente)
    })
  }, [id, esEdicion, esDomicilio])

  useEffect(() => {
    if (digitado === '') {
      setProductos([])
      return
    }
    let cancelado = false
    const traer = async () => {
      const tmp = await apiRequest(`/api/producto/listar/${digitado}`, { metodo: 'GET' })
      if (!cancelado) setProductos(Array.isArray(tmp) ? tmp : [])
    }
    traer()
    return () => {
      cancelado = true
    }
  }, [digitado])

  useEffect(() => {
    const suma = pedido.reduce((acc, p) => acc + p.subtotalPedido, 0)
    setTotal(suma)
  }, [pedido])

  const elegirProducto = (producto) => {
    const existe = pedido.some((p) => p.nombreProducto === producto.nombreProducto)
    if (existe) return
    setPedido((prev) => [
      ...prev,
      {
        indice: producto.id,
        nombreProducto: producto.nombreProducto,
        cantidadProducto: 1,
        precioMomento: producto.precio,
        subtotalPedido: producto.precio,
        peticionCliente: '',
      },
    ])
    setBusquedaAbierta(false)
    setDigitado('')
    setProductos([])
  }

  const actualizarCantidad = (cantidad, index, subtotal) => {
    setPedido((prev) =>
      prev
        .map((i) =>
          i.nombreProducto === index
            ? { ...i, cantidadProducto: cantidad, subtotalPedido: subtotal }
            : i
        )
        .filter((t) => t.cantidadProducto > 0)
    )
  }

  const añadirDetalle = (nombre, peticion) => {
    setPedido((prev) =>
      prev.map((i) =>
        i.nombreProducto === nombre ? { ...i, peticionCliente: peticion } : i
      )
    )
  }

  const cambiarMesa = (e) => {
    const val = e.target.value
    if (val.trim() === '' || Number.isNaN(val)) {
      setMesaPedido(0)
      toast.error('Número de mesa inválido')
      return
    }
    const n = parseInt(val, 10)
    if (n <= 0 || n > 100) {
      setMesaPedido(0)
      toast.error('Rango de mesa inválido (1-100)')
      return
    }
    setMesaPedido(n)
  }

  const cambiarDomi = (e) => {
    const limpio = limpiarNombre(e.target.value)
    if (limpio !== e.target.value) {
      toast.error('No se permiten caracteres especiales')
    }
    setNombreDomicilio(limpio)
  }

  const productosCuerpo = () =>
    pedido.map((p) => (
      <FilaTomarPedido
        key={p.nombreProducto}
        nombre_producto={p.nombreProducto.charAt(0).toUpperCase() + p.nombreProducto.slice(1)}
        funcion={actualizarCantidad}
        index={p.nombreProducto}
        precio={p.precioMomento}
        cantidad={p.cantidadProducto}
        addDetalle={añadirDetalle}
        detalle={p.peticionCliente}
      />
    ))

  const imprimirComanda = (cuerpo) =>
    apiRequest('/api/impresora/comanda', { metodo: 'POST', body: cuerpo })

  const confirmarPedido = async () => {
    if (mesaPedido != null) {
      return apiRequest(`/api/pedidos/crear/${mesero}`, {
        metodo: 'POST',
        body: {
          numeroMesa: mesaPedido,
          total,
          productos: pedido.map((p) => ({
            nombreProducto: p.nombreProducto,
            cantidadProducto: p.cantidadProducto,
            subtotalPedido: p.subtotalPedido,
            precioMomento: p.precioMomento,
            peticionCliente: p.peticionCliente,
          })),
        },
      })
    }
    return apiRequest(`/api/pedidos/crear/domicilio/${mesero}`, {
      metodo: 'POST',
      body: {
        numeroMesa: 0,
        total,
        productos: pedido.map((p) => ({
          nombreProducto: p.nombreProducto,
          cantidadProducto: p.cantidadProducto,
          subtotalPedido: p.subtotalPedido,
          precioMomento: p.precioMomento,
          peticionCliente: p.peticionCliente,
        })),
        nombreDomicilio,
        numeroCliente: celCliente,
      },
    })
  }

  const actualizarPedido = async () =>
    apiRequest(`/api/pedidos/actualizar/${id}`, {
      metodo: 'PUT',
      body: esDomicilio
        ? {
            numeroMesa: 0,
            productos: pedido.map((p) => ({
              nombreProducto: p.nombreProducto,
              cantidadProducto: p.cantidadProducto,
              subtotalPedido: p.subtotalPedido,
              precioMomento: p.precioMomento,
              peticionCliente: p.peticionCliente,
            })),
            nombreDomicilio,
            estadoPago: 'PENDIENTE',
            numeroCliente: celCliente,
          }
        : {
            numeroMesa: mesaPedido,
            productos: pedido.map((p) => ({
              nombreProducto: p.nombreProducto,
              cantidadProducto: p.cantidadProducto,
              subtotalPedido: p.subtotalPedido,
              precioMomento: p.precioMomento,
              peticionCliente: p.peticionCliente,
            })),
          },
    })

  const cancelarPedido = async () => {
    await apiRequest(`/api/pedidos/actualizar/${id}/CANCELADO/ANULADO`, { metodo: 'PUT' })
    navigate(rol === 'ROLE_MESERA' ? '/mesera' : '/pedidos')
  }

  const confirmar = async () => {
    if (pedido.length === 0) return
    if (esDomicilio && (!nombreDomicilio || nombreDomicilio === '' || nombreDomicilio === '.')) {
      toast.error('Ingresa el nombre del cliente')
      return
    }
    if (!esDomicilio && (!mesaPedido || mesaPedido === 0)) {
      toast.error('Ingresa un número de mesa válido')
      return
    }
    try {
      if (esEdicion) {
        await actualizarPedido()
        await imprimirComanda({
          idPedido: Number(id),
          impresoraIp: import.meta.env.VITE_IMPRESORA_COCINA || '192.168.1.200',
          numeroMesa: esDomicilio ? null : mesaPedido,
          nombreDomicilio: esDomicilio ? nombreDomicilio : null,
          productos: pedido.map((p) => ({
            nombreProducto: p.nombreProducto,
            cantidadProducto: p.cantidadProducto,
            subtotalPedido: p.subtotalPedido,
            precioMomento: p.precioMomento,
            peticionCliente: p.peticionCliente,
          })),
        })
        toast.success('¡Pedido actualizado con éxito!')
        navigate(rol === 'ROLE_MESERA' ? '/mesera' : esDomicilio ? '/pedidos/true' : '/pedidos')
      } else {
        const res = await confirmarPedido()
        const pedidoImprimir = await apiRequest(`/api/detallePedido/${res.id}`, {
          metodo: 'GET',
        })
        await imprimirComanda({
          idPedido: res.id,
          impresoraIp: import.meta.env.VITE_IMPRESORA_COCINA || '192.168.1.200',
          numeroMesa: esDomicilio ? null : mesaPedido,
          nombreDomicilio: esDomicilio ? nombreDomicilio : null,
          productos: pedidoImprimir,
        })
        toast.success('¡Pedido confirmado con éxito!')
        navigate(rol === 'ROLE_MESERA' ? '/mesera' : esDomicilio ? '/pedidos/true' : '/pedidos')
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const confirmarValido =
    pedido.length > 0 &&
    (esDomicilio
      ? nombreDomicilio && nombreDomicilio !== '' && nombreDomicilio !== '.'
      : mesaPedido && mesaPedido !== 0)

  return (
    <section className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-4 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {esEdicion ? `Editar pedido ${id}` : 'Nuevo pedido'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {esDomicilio ? `Domicilio${nombreDomicilio ? `: ${nombreDomicilio}` : ''}` : `Mesa N.${mesaPedido ?? '—'}`}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {esDomicilio ? 'Datos del cliente' : 'Mesa'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {esDomicilio ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nombreDomi">Nombre cliente</Label>
                <Input
                  id="nombreDomi"
                  type="text"
                  value={nombreDomicilio ?? ''}
                  onChange={cambiarDomi}
                  placeholder="Ingrese el nombre del cliente"
                  disabled={esEdicion}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="celCliente">Celular</Label>
                <Input
                  id="celCliente"
                  type="text"
                  value={celCliente ?? ''}
                  onChange={(e) => setCelCliente(e.target.value)}
                  placeholder="Cel"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mesa">Número de mesa</Label>
              <Input
                id="mesa"
                type="text"
                inputMode="numeric"
                value={mesaPedido ?? ''}
                onChange={cambiarMesa}
                placeholder="1 - 100"
                disabled={esEdicion}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base">Productos del pedido</CardTitle>
          <Button onClick={() => setBusquedaAbierta(true)}>
            <Plus className="h-5 w-5" aria-hidden="true" />
            <span>Añadir producto</span>
          </Button>
        </CardHeader>
        <CardContent>
          {pedido.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aún no has añadido productos.
            </p>
          ) : (
            <ScrollArea className="h-[40vh] pr-3">
              <div className="flex flex-col gap-2">{productosCuerpo()}</div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="flex flex-col leading-tight">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Total</span>
          <span className="text-2xl font-bold tabular-nums">{formateador.format(total)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {esEdicion && (
            <Button variant="destructive" onClick={cancelarPedido}>
              <Trash2 className="h-5 w-5" aria-hidden="true" />
              <span>Anular pedido</span>
            </Button>
          )}
          <Button onClick={confirmar} disabled={!confirmarValido}>
            <Receipt className="h-5 w-5" aria-hidden="true" />
            <span>{esEdicion ? 'Actualizar pedido' : 'Confirmar pedido'}</span>
          </Button>
        </div>
      </div>

      <Dialog open={busquedaAbierta} onOpenChange={setBusquedaAbierta}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Buscar producto</DialogTitle>
            <DialogDescription>
              Escribe el nombre (o parte) para filtrar el catálogo.
            </DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              autoFocus
              value={digitado}
              onChange={(e) => setDigitado(e.target.value)}
              placeholder="Ingrese un dato de búsqueda"
              className="pl-10"
            />
          </div>
          <div className="max-h-72 overflow-y-auto rounded-md border bg-muted/30">
            {digitado === '' ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Empieza a escribir para ver resultados.
              </p>
            ) : productos.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No hay coincidencias.
              </p>
            ) : (
              <ul className="divide-y">
                {productos.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => elegirProducto(p)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        'focus-visible:outline-none focus-visible:bg-accent'
                      )}
                    >
                      <span className="font-medium">
                        {p.nombreProducto.charAt(0).toUpperCase() + p.nombreProducto.slice(1)}
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {formateador.format(p.precio)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default TomarPedido
