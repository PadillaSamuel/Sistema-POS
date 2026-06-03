import "./App.css";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import RequireAuth from "@/guards/require_auth";
import RequireRol from "@/guards/require_rol";
import AuthenticatedLayout from "@/layouts/authenticated_layout";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import BuscarProducto from "./pages/buscar_producto";
import CrearProducto from "./pages/crear_producto";
import CrearDomicilio from "./pages/crear_domicilio";
import PedidoMesera from "./pages/pedidos_mesera";
import Pedidos from "./pages/pedidos";
import TomarPedido from "./pages/tomar_pedido";
import VerPedido from "./pages/ver_pedido";
import Historial from "./pages/historial";
import Metricas from "./pages/metricas";
import Anulados from "./pages/anulados";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route element={<AuthenticatedLayout />}>
            <Route element={<RequireRol roles={["ROLE_CAJA"]} />}>
              <Route path="/caja" element={<Dashboard />} />
              <Route path="/buscar-producto" element={<BuscarProducto />} />
              <Route path="/crear-producto" element={<CrearProducto />} />
              <Route
                path="/editar-producto/:id/:nombre/:precio"
                element={<CrearProducto />}
              />
              <Route path="/historial" element={<Historial />} />
              <Route path="/metricas" element={<Metricas />} />
              <Route path="/ver-anulados" element={<Anulados />} />
              <Route path="/crear-domicilio" element={<CrearDomicilio />} />
            </Route>

            <Route element={<RequireRol roles={["ROLE_MESERA"]} />}>
              <Route path="/mesera" element={<PedidoMesera />} />
            </Route>

            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/pedidos/:domis" element={<Pedidos />} />
            <Route path="/tomar-pedido" element={<TomarPedido />} />
            <Route path="/tomar-pedido/:id/:mesa" element={<TomarPedido />} />
            <Route path="/tomar-pedido/:domi" element={<TomarPedido />} />
            <Route
              path="/tomar-pedido/domi/:id/:domi"
              element={<TomarPedido />}
            />
            <Route
              path="/ver-pedido/:id/:mesa/:estado"
              element={<VerPedido />}
            />
            <Route path="/ver-pedido/:id/:mesa" element={<VerPedido />} />
            <Route
              path="/ver-pedido/domi/:id/:domi"
              element={<VerPedido />}
            />
            <Route
              path="/ver-pedido-domi/:id/:domi/:estado"
              element={<VerPedido />}
            />
          </Route>
        </Route>
      </Routes>

      <ToastContainer position="bottom-right" autoClose={2500} />
    </>
  );
};

export default App;
