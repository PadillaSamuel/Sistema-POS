import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  BarChart3,
  Bike,
  ChevronDown,
  ClipboardList,
  List,
  LogOut,
  Menu,
  Pizza,
  PlusCircle,
  Printer,
  Receipt,
  Search,
  X,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const NAV_POR_ROL = {
  ROLE_CAJA: [
    { titulo: 'Ventas', icono: BarChart3, ruta: '/ver-ventas' },
    {
      titulo: 'Productos',
      icono: Pizza,
      subItems: [
        { titulo: 'Gestionar', icono: List, ruta: '/gestion-productos' },
        { titulo: 'Buscar', icono: Search, ruta: '/buscar-producto' },
        { titulo: 'Crear producto', icono: PlusCircle, ruta: '/crear-producto' },
      ],
    },
    {
      titulo: 'Pedidos',
      icono: Printer,
      subItems: [
        { titulo: 'Ver pedidos', icono: List, ruta: '/pedidos' },
        { titulo: 'Ver anulados', icono: XCircle, ruta: '/ver-anulados' },
      ],
    },
    { titulo: 'Domicilios', icono: Bike, ruta: '/gestionar-domis' },
    { titulo: 'Tomar pedido', icono: ClipboardList, ruta: '/tomar-pedido' },
  ],
  ROLE_MESERA: [
    { titulo: 'Mis pedidos', icono: Receipt, ruta: '/mesera' },
    { titulo: 'Tomar pedido', icono: ClipboardList, ruta: '/tomar-pedido' },
  ],
}

const ETIQUETA_ROL = {
  ROLE_CAJA: 'Caja',
  ROLE_MESERA: 'Mesera',
}

const Sidebar = ({ usuario, alCerrarSesion }) => {
  const [abierto, setAbierto] = useState(false)
  const location = useLocation()
  const rol = usuario?.rol
  const navegacion = NAV_POR_ROL[rol] || []
  const etiquetaRol = ETIQUETA_ROL[rol] || 'Invitado'

  const contieneRutaActiva = (item) => {
    if (item.ruta) return location.pathname === item.ruta
    if (item.subItems) {
      return item.subItems.some((sub) => location.pathname === sub.ruta)
    }
    return false
  }

  const manejarLogout = () => {
    if (typeof alCerrarSesion === 'function') alCerrarSesion()
  }

  const renderItem = (item) => {
    const Icono = item.icono
    const activo = contieneRutaActiva(item)

    if (item.subItems && item.subItems.length > 0) {
      return (
        <Collapsible
          key={item.titulo}
          defaultOpen={activo}
          className="group/collapsible"
        >
          <CollapsibleTrigger
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              activo && 'bg-accent/60 text-accent-foreground'
            )}
            aria-label={`${item.titulo}, sección desplegable`}
          >
            <Icono className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-left">{item.titulo}</span>
            <ChevronDown
              className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
              aria-hidden="true"
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
            <ul role="menu" className="mt-1 flex flex-col gap-0.5 border-l border-border/60 pl-3 ml-3">
              {item.subItems.map((sub) => {
                const IconoSub = sub.icono
                return (
                  <li key={sub.ruta} role="none">
                    <NavLink
                      to={sub.ruta}
                      end
                      role="menuitem"
                      onClick={() => setAbierto(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                          'hover:bg-accent hover:text-accent-foreground',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                        )
                      }
                    >
                      <IconoSub className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{sub.titulo}</span>
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <NavLink
        key={item.ruta}
        to={item.ruta}
        end
        onClick={() => setAbierto(false)}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isActive && 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
          )
        }
      >
        <Icono className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{item.titulo}</span>
      </NavLink>
    )
  }

  const cuerpo = (
    <div className="flex h-full flex-col bg-card text-card-foreground">
      <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <Pizza className="h-5 w-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Artesanos</span>
            <span className="text-xs text-muted-foreground">{etiquetaRol}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setAbierto(false)}
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <nav aria-label="Navegación principal" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {navegacion.map((item) => (
            <li key={item.titulo}>{renderItem(item)}</li>
          ))}
        </ul>
      </nav>

      <Separator />

      <div className="px-4 py-4">
        <div className="mb-3 flex flex-col leading-tight">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Sesión activa</span>
          <span className="truncate text-sm font-medium" title={usuario?.nombre}>
            {usuario?.nombre || 'Sin sesión'}
          </span>
        </div>
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={manejarLogout}
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span>Cerrar sesión</span>
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setAbierto(true)}
        className="fixed left-3 top-3 z-40 lg:hidden"
        aria-label="Abrir menú de navegación"
        aria-expanded={abierto}
        aria-controls="sidebar-panel"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>

      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setAbierto(false)}
          aria-hidden="true"
        />
      )}

      <aside
        id="sidebar-panel"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform border-r border-border/60 bg-card shadow-xl transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          abierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Barra lateral"
      >
        {cuerpo}
      </aside>
    </>
  )
}

export default Sidebar
