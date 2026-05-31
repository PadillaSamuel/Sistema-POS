import "./ver_ventas.css";
import BotonPedido from "../components/boton_pedido";
import { apiRequest } from "../services/api";
import { useEffect, useState } from "react";
import arrow from "../assets/flecha.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const formateador = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
});

const VerVentas = () => {
  const [pedidos, setPedidos] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalesPorMetodo, setTotalesPorMetodo] = useState({
    EFECTIVO: 0,
    TRANSFERENCIA: 0,
    DATAFONO: 0
  });
  const navigate = useNavigate();

  const traerVentasConPagos = async (inicio, fin) => {
    try {
      const response = await apiRequest(
        `/api/pedidos/resueltos/cierre/pagos/${inicio}/${fin}`,
        {
          metodo: "GET",
        },
      );
      toast.success("Ventas obtenidas");
      return response;
    } catch (err) {
      const msj = String(err?.message || err);
      if (msj.includes("404")) {
        toast.info("No se encontraron ventas en ese rango de fechas");
        return [];
      }
      toast.error("¡Error al cargar las ventas!");

      throw err;
    }
  };

  const buscarVentas = async (e) => {
    e.preventDefault();
    const fechaInicio = e.target.inicio.value;
    const fechaFin = e.target.fin.value;

    const res = await traerVentasConPagos(fechaInicio, fechaFin);

    setPedidos(res);
  };

  useEffect(() => {
    const ventasActuales = async () => {
      const hoy = new Date().toLocaleDateString("en-CA");
      console.log(hoy);
      const res = await traerVentasConPagos(hoy, hoy);
      setPedidos(res);
    };
    ventasActuales();
  }, []);

  useEffect(() => {
    const acumular = () => {
      return pedidos.reduce((cnt, p) => {
        return cnt + (p.total || 0);
      }, 0);
    };

    const totales = {
      EFECTIVO: 0,
      TRANSFERENCIA: 0,
      DATAFONO: 0
    };

    pedidos.forEach(p => {
      if (p.pagos && Array.isArray(p.pagos)) {
        p.pagos.forEach(pago => {
          const metodo = pago.metodoPago;
          if (totales.hasOwnProperty(metodo)) {
            totales[metodo] += pago.monto || 0;
          }
        });
      }
    });

    const suma = acumular();

    setTotal(suma);
    setTotalesPorMetodo(totales);
  }, [pedidos]);

  return (
    <>
      <section className="sec-ver-ventas">
        <form onSubmit={buscarVentas}>
          <div className="div-titulo-ver-ventas">
            <button type="button" onClick={() => navigate("/caja")}>
              <img src={arrow} alt="" />
            </button>
            <h2>Historial Pedidos</h2>
          </div>

          <div className="contenedor-fechas">
            <div className="div-fechas">
              <label htmlFor="">Fecha Inicio</label>
              <input type="date" name="inicio" className="inputs" />
            </div>
            <div className="div-fechas">
              <label htmlFor="">Fecha Fin</label>
              <input type="date" name="fin" className="inputs" />
            </div>
          </div>

          <div className="pedidos-encontrados">
            {pedidos.map(p => (
              p.numeroMesa != 0 ? (
                <BotonPedido
                  key={p.id}
                  ruta={`/ver-pedido/${p.id}/${p.numeroMesa}/resuelto`}
                  num_mesa={p.numeroMesa}
                  num_pedido={p.id}
                  pagos={p.pagos}
                />
              ) : (
                <BotonPedido
                  key={p.id}
                  ruta={`/ver-pedido-domi/${p.id}/${p.nombreDomicilio}/resuelto`}
                  nombreDomi={p.nombreDomicilio}
                  num_pedido={p.id}
                  pagos={p.pagos}
                />
              )

            ))}
          </div>

          <div className="footer-ver-ventas">
            <button type="submit" className="boton-buscar">
              Buscar
            </button>
            <h2 className="total-caja">EFECTIVO {formateador.format(totalesPorMetodo.EFECTIVO)}</h2>
            <h2 className="total-caja">TRANSFERENCIA {formateador.format(totalesPorMetodo.TRANSFERENCIA)}</h2>
            <h2 className="total-caja">DATAFONO {formateador.format(totalesPorMetodo.DATAFONO)}</h2>
          </div>
        </form>
      </section>
    </>
  );
};

export default VerVentas;