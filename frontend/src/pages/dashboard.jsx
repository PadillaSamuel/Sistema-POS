import { useOutletContext } from 'react-router-dom'
import { Pizza } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const ETIQUETA_ROL = {
  ROLE_CAJA: 'Caja',
  ROLE_MESERA: 'Mesera',
}

const Dashboard = () => {
  const { usuario } = useOutletContext() || {}
  const nombre = usuario?.nombre || 'usuario'
  const rol = ETIQUETA_ROL[usuario?.rol] || 'Invitado'

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          ¡Bienvenido, {nombre}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Has iniciado sesión como <span className="font-medium">{rol}</span>. Usa la barra lateral para comenzar.
        </p>
      </header>

      <Card className="border-dashed">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"
              aria-hidden="true"
            >
              <Pizza className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Artesanos POS</CardTitle>
              <CardDescription>Sistema de punto de venta</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Selecciona una opción en la barra lateral para gestionar productos, pedidos, ventas o domicilios.
        </CardContent>
      </Card>
    </section>
  )
}

export default Dashboard
