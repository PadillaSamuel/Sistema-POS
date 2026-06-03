import { useNavigate } from 'react-router-dom'
import { ChevronRight, ShoppingBag, User } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const BotonPedido = ({ num_pedido, num_mesa, ruta, nombreDomi, className }) => {
  const navigate = useNavigate()
  const manejarClick = () => {
    if (ruta) navigate(ruta)
  }

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={manejarClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          manejarClick()
        }
      }}
      className={cn(
        'cursor-pointer border-border/60 transition-all hover:scale-[0.99] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-hidden="true"
          >
            {nombreDomi ? <User className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold">Pedido {num_pedido}</span>
            <span className="text-sm text-muted-foreground">
              {nombreDomi ? nombreDomi : `Mesa N.${num_mesa}`}
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </CardContent>
    </Card>
  )
}

export default BotonPedido
