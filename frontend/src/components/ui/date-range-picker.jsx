import * as React from 'react'
import { addDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const formatear = (fecha) => (fecha ? format(fecha, "dd 'de' MMM yyyy", { locale: es }) : '')

const formatearCorto = (fecha) => (fecha ? format(fecha, 'dd/MM/yyyy') : '')

const DateRangePicker = ({
  className,
  value,
  onChange,
  placeholder = 'Selecciona un rango de fechas',
  align = 'start',
}) => {
  const [abierto, setAbierto] = React.useState(false)

  const hoy = new Date()
  const hace30 = addDays(hoy, -30)

  const handleSelect = (rango) => {
    onChange?.(rango)
    if (rango?.from && rango?.to) {
      setAbierto(false)
    }
  }

  const desde = value?.from
  const hasta = value?.to
  const etiqueta = desde && hasta
    ? `${formatearCorto(desde)} → ${formatearCorto(hasta)}`
    : desde
      ? `${formatearCorto(desde)} → …`
      : placeholder

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={abierto} onOpenChange={setAbierto}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !desde && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>{etiqueta}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={desde ?? hace30}
            selected={value}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={es}
            toDate={new Date(new Date().setHours(23, 59, 59, 999))}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DateRangePicker, formatear }
