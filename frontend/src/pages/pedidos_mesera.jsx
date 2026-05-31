import './pedidos_mesera.css'
import BotonPedido from '../components/boton_pedido'
import volver from '../assets/flecha.png'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'
import { useEffect, useState } from 'react'

const PedidoMesera = () => {
    const navigate = useNavigate()
    const [pedidos, setPedidos] = useState([])

    const traerPedidos = async () => {
        return apiRequest("/api/pedidos/listar", {
            metodo: "GET"
        })
    }

    useEffect(() => {
        const mostrarPedidos = async () => {
            const tmp = await traerPedidos()
            setPedidos(tmp)
        }
        mostrarPedidos()

        const intervalo = setInterval(async () => {
            const res = await traerPedidos()
            setPedidos(res)
        }, 10000);

        return () => clearInterval(intervalo)
    }, [])


    return (
        <>
            <section className='pedido-mesera-sec'>
                <div className='pedido-mesera-head'>
                    <button className='boton-arrow' onClick={() => navigate("/")}>
                        <img src={volver} alt="" />
                    </button>
                    <button className='boton-nuevo-pedido' onClick={() => {
                        navigate("/tomar-pedido")
                    }}>
                        + Nuevo pedido
                    </button>

                    
                </div>


                <div className='pedido-mesera-pedidos'>
                    <h3 className='title-pedido'>Pedidos</h3>
                    <div>
                        {pedidos != null && pedidos.length > 0 ? (
                            pedidos.map(p => (
                                p.numeroMesa !== 0 && (
                                    <BotonPedido key={p.id} num_mesa={p.numeroMesa} num_pedido={p.id} ruta={`/tomar-pedido/${p.id}/${p.numeroMesa}`} />
                                )
                            ))
                        ) : (
                            <p>No hay pedidos en curso</p>
                        )

                        }

                    </div>

                </div>
            </section>
        </>
    )
}

export default PedidoMesera