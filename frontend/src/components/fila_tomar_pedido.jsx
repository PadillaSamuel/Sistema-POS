import { useState } from 'react'
import { Minus, MoreHorizontal, Plus } from 'lucide-react'

import { formateador } from '../lib/format'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const FilaTomarPedido = ({
  nombre_producto,
  funcion,
  index,
  precio,
  cantidad,
  addDetalle,
  detalle,
}) => {
  const [cnt, setCnt] = useState(cantidad)
  const [detalleLocal, setDetalleLocal] = useState(detalle || '')

  const subtotal = cnt * precio

  const incrementar = () => {
    const nuevoCnt = cnt + 1
    const nuevoSubtotal = precio * nuevoCnt
    setCnt(nuevoCnt)
    funcion(nuevoCnt, index, nuevoSubtotal)
  }

  const decrementar = () => {
    const nuevoCnt = Math.max(0, cnt - 1)
    const nuevoSubtotal = precio * nuevoCnt
    setCnt(nuevoCnt)
    funcion(nuevoCnt, index, nuevoSubtotal)
  }

  const guardarDetalle = (valor) => {
    setDetalleLocal(valor)
    addDetalle?.(index, valor)
  }

  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-2 py-2 text-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted font-semibold tabular-nums">
        {cnt}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex flex-1 items-center justify-between gap-2 rounded-sm px-2 py-1 text-left text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${nombre_producto}, agregar detalle`}
          >
            <span className="truncate">{nombre_producto}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="start">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`detalle-${index}`} className="text-sm">
              Detalle del producto
            </Label>
            <Input
              id={`detalle-${index}`}
              value={detalleLocal}
              onChange={(e) => guardarDetalle(e.target.value)}
              placeholder="Ej. Sin cebolla, borde de queso..."
            />
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={decrementar}
          aria-label={`Disminuir cantidad de ${nombre_producto}`}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={incrementar}
          aria-label={`Aumentar cantidad de ${nombre_producto}`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums">
        {formateador.format(subtotal)}
      </div>
    </div>
  )
}

export default FilaTomarPedido
