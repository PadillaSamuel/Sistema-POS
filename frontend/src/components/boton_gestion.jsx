import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'

const Boton = ({ imagen, nombre, ruta, icon: Icono }) => {
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
      className="flex h-full w-full cursor-pointer items-center justify-center border-border/60 bg-card transition-all hover:scale-[0.97] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardContent className="flex flex-col items-center justify-center gap-2 p-6 text-center">
        {Icono ? (
          <Icono className="h-10 w-10 text-primary" aria-hidden="true" />
        ) : imagen ? (
          <img src={imagen} alt="" className="h-10 w-10 object-contain" />
        ) : null}
        <span className="text-sm font-medium">{nombre}</span>
      </CardContent>
    </Card>
  )
}

export default Boton
