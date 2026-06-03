import * as React from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const formatearCorto = (fecha) => (fecha ? format(fecha, 'dd/MM/yyyy') : '')

const DatePicker = ({
  className,
  value,
  onChange,
  placeholder = 'Selecciona una fecha',
  align = 'start',
  disabled,
  fromDate,
  toDate,
  ariaLabel,
}) => {
  const [abierto, setAbierto] = React.useState(false)

  const manejarSeleccion = (fecha) => {
    onChange?.(fecha)
    setAbierto(false)
  }

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label={ariaLabel}
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{value ? formatearCorto(value) : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={value}
          onSelect={manejarSeleccion}
          locale={es}
          fromDate={fromDate}
          toDate={toDate}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
