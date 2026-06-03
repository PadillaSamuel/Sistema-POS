import { useNavigate } from 'react-router-dom'
import { ArchiveX, ArrowLeft, PlusCircle, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const Accion = ({ icono: Icono, titulo, descripcion, ruta }) => {
  const navigate = useNavigate()
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => navigate(ruta)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(ruta)
        }
      }}
      className="cursor-pointer border-border/60 transition-all hover:scale-[0.98] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardContent className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Icono className="h-7 w-7" />
        </div>
        <CardTitle className="text-base">{titulo}</CardTitle>
        {descripcion && (
          <CardDescription className="text-xs">{descripcion}</CardDescription>
        )}
      </CardContent>
    </Card>
  )
}

const GestionProductos = () => {
  const navigate = useNavigate()

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <header className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/caja')}
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Gestión de productos</h1>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Accion
          icono={PlusCircle}
          titulo="Crear producto"
          descripcion="Registra un nuevo producto en el menú."
          ruta="/crear-producto"
        />
        <Accion
          icono={Search}
          titulo="Buscar producto"
          descripcion="Encuentra un producto por nombre o ID."
          ruta="/buscar-producto"
        />
      </div>

      <footer className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => navigate('/ver-anulados')}
        >
          <ArchiveX className="h-5 w-5" aria-hidden="true" />
          <span>Ver anulados</span>
        </Button>
      </footer>
    </section>
  )
}

export default GestionProductos
