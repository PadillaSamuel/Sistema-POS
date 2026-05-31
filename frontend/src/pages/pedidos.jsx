import './pedidos.css'
import BotonPedido from '../components/boton_pedido'
import { apiRequest } from '../services/api'
import { useEffect, useState } from 'react'
import arrow from '../assets/flecha.png'
import { useNavigate, useParams } from 'react-router-dom'

const Pedidos = () => {

    const [pedido, setPedido] = useState([])
    const navigate = useNavigate();
    const { domis } = useParams();

    const listarPedidos = () => {
        return apiRequest("/api/pedidos/listar", {
            metodo: "GET",
        })
    }


    useEffect(() => {

        const cargar = async () => {

            const res = await listarPedidos()
            setPedido(res)
            console.log(res);
        }
        cargar()

        const intervalo = setInterval(async () => {
            const tmp = await listarPedidos()
            setPedido(tmp)
        }, 10000);
        return () => clearInterval(intervalo);
    }
        , [])





    return (
        <>
            <section className='pedidos_section'>
                <div className='div-head-pedidos'>
                    <button onClick={() => {
                        if (domis!=undefined) {
                            navigate('/gestionar-domis')    
                        }else{
                            navigate('/caja')
                        }
                        
                    }}
                    ><img src={arrow} alt="" /></button>
                    <h2>Pedidos</h2>
                </div>

<div className='scroll_pedidos'>
                    {pedido != null && pedido.length > 0 ? (
                        pedido.map(p => (
                            domis != undefined ? (
                                p.numeroMesa === 0 && (
                                    <BotonPedido key={p.id} ruta={`/tomar-pedido/domi/${p.id}/${p.nombreDomicilio || 'domicilio'}`} nombreDomi={p.nombreDomicilio || 'domicilio'} num_pedido={p.id} />
                                )
                            ) : (
                                p.numeroMesa === 0 ? (
                                    <BotonPedido key={p.id} ruta={`/ver-pedido/domi/${p.id}/${p.nombreDomicilio || 'domicilio'}`} nombreDomi={p.nombreDomicilio || 'domicilio'} num_pedido={p.id} />
                                ) : (
                                    <BotonPedido key={p.id} ruta={`/ver-pedido/${p.id}/${p.numeroMesa}`} num_mesa={p.numeroMesa} num_pedido={p.id} />
                                )
                            )
                        ))
                    ) : (
                        <p>No hay pedidos en curso</p>
                    )
                    }


                </div>
            </section>
        </>
    )
}


export default Pedidos