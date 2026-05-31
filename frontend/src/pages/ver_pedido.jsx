import './ver_pedido.css'
import FilaPedido from '../components/fila_pedido'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../services/api';
import { useEffect, useRef, useState } from 'react';
import { formateador } from './ver_ventas';
import { useReactToPrint } from "react-to-print";


const VerPedido = ({ n_pedido, n_mesa }) => {
    const [pedido, setPedido] = useState([])
    const [cantidad, setCantidad] = useState(0)
    const { id, mesa, estado, domi } = useParams();
    const [total, setTotal] = useState(0)
    const [alternar, setAlternar] = useState(false);
    const comandaRef = useRef();
    const botonref = useRef(null)
    const [pos, setPos] = useState(null)
    const navigate = useNavigate();
    const timer = useRef(null);
    const [celular, setCelular] = useState(null)

    const pedidoPorId = async () => {
        return apiRequest(`/api/detallePedido/${id}`, {
            metodo: "GET"
        })
    }
    const listarPedido = async () => {
        return apiRequest('/api/pedidos/listar', {
            metodo: 'GET'
        })
    }

    const listarResueltos = async () => {
        return apiRequest('/api/pedidos/resueltos', {
            metodo: 'GET'
        })
    }

    const confirmarPedido = async (tipoPago) => {
        return apiRequest(`/api/pedidos/actualizar/${id}/RESUELTO/${tipoPago}`, {
            metodo: "PUT"
        })
    }

    const anularPedido = async () => {
        return apiRequest(`/api/pedidos/actualizar/${id}/CANCELADO/NO_PAGO`, {
            metodo: "PUT"
        })
    }

    const cancelarPedido = async () => {
        const tmp = await anularPedido();
        navigate("/pedidos");
    }

    const resolverPedido = async (tipoPago) => {
        const tmp = await confirmarPedido(tipoPago)
        navigate("/pedidos");
    }
    useEffect(() => {
        const traerPedido = async () => {
            const tmp = await pedidoPorId()
            setCantidad(tmp.length)
            setPedido(tmp)
            const suma = tmp.reduce((cnt, p) => {
                return cnt + p.subtotalPedido
            }, 0)
            setTotal(suma)
        }
        traerPedido()
    }, [])

    useEffect(() => {
        const cargarCel = async () => {
            let pediList = null
            if (estado != undefined) {
                pediList = await listarResueltos()
            } else {
                pediList = await listarPedido()
            }
            if (pediList != null) {
                const pedidoCel = pediList.find(p => p.id === Number(id))
                if (pedidoCel?.numeroCliente != undefined) {
                    setCelular(pedidoCel.numeroCliente)
                }
            }

        }
        cargarCel()
    }, [])

    const imprimir = useReactToPrint({
        contentRef: comandaRef

    });

    const impresionFac = async () => {
        await imprimirFactura({
            idPedido: id,
            impresoraIp: import.meta.env.VITE_IMPRESORA_FACTURA || "192.168.1.100",
            numeroMesa: mesa != undefined ? mesa : null,
            nombreDomicilio: domi != undefined ? domi : null,
            numeroCliente: celular,
            productos: pedido.map(p => (
                {
                    nombreProducto: p.nombreProducto,
                    cantidadProducto: p.cantidadProducto,
                    subtotalPedido: p.subtotalPedido,
                    precioMomento: p.precioMomento,
                    peticionCliente: p.peticionCliente
                }
            )),
            total: total

        })

    }

    const imprimirFactura = async (cuerpo) => {
        return apiRequest('/api/impresora/factura', {
            metodo: 'POST',
            body: cuerpo
        })
    }




    return (
        <>
            <section className='fila-pedido-sec'>
                <div className='fila-pedido-div-uno'>
                    <div className='fila-pedido-text-pedido'>
                        <h3>Pedido {id}</h3>
                    </div>
                    <div className='fila-pedido-text-mesa'>
                        {domi != undefined ? (
                            <h3>{domi}</h3>
                        ) : (
                            <h3>Mesa N.{mesa}</h3>
                        )

                        }

                    </div>
                </div>
                <div className='fila-pedido-div-dos'>
                    <div className='fila-pedido-index'>
                        <h3>Productos</h3>
                        <h3>Cantidad</h3>
                        <h3>Precio</h3>
                        <h3>Total</h3>
                    </div>
                    <div className='filas_ver'>

                        {
                            pedido.map((p, index) => (
                                <FilaPedido key={index} nombre={p.nombreProducto.charAt(0).toUpperCase() + p.nombreProducto.slice(1)} cantidad={p.cantidadProducto} precio={formateador.format(p.precioMomento)} subtotal={formateador.format(p.subtotalPedido)} />
                            ))


                        }

                    </div>
                    <div className='fila-pedido-total'>
                        <h3>Total</h3>
                        <div>{formateador.format(total)}</div>
                    </div>
                </div>
                <div className='fila-pedido-div-tres'>
                    {estado != undefined ? (
                        <>


                            <div>
                                <button className='fila-boton-dos' onClick={impresionFac}>Imprimir Comanda</button>
                            </div>
                        </>

                    ) : (
                        <>
                            <div>
                                <button className='fila-boton-uno' onClick={cancelarPedido}>Anular Pedido</button>
                            </div>
                            <div>
                                <button ref={botonref} className='fila-boton-dos' onClick={() => {
                                    setPos({
                                        top: botonref.current.getBoundingClientRect().bottom + window.scrollY,
                                        left: botonref.current.getBoundingClientRect().left + window.scrollX + 6
                                    })
                                }
                                }
                                    onMouseLeave={() => {
                                        timer.current = setTimeout(() => {
                                            if (alternar == false) {
                                                setPos(null);
                                            }
                                        }, 2000);
                                    }}>Confirmar Pago</button>
                            </div>
                            <div>
                                <button className='fila-boton-dos' onClick={impresionFac}>Imprimir Comanda</button>
                            </div>
                        </>
                    )
                    }
                    {pos != null ?
                        (
                            <div className='boton-opciones'
                                style={{
                                    position: 'absolute',
                                    top: pos.top,
                                    left: pos.left,

                                }}
                                onMouseLeave={() => {
                                    setPos(null)
                                    setAlternar(false)
                                    clearTimeout(timer.current)
                                }}
                                onMouseEnter={() => {
                                    setAlternar(true)
                                    clearTimeout(timer.current)
                                }}
                            >
                                <div className='opcion-menu' onClick={() => resolverPedido("TRANSFERENCIA")}>Pago transferencia</div>
                                <div className='opcion-menu' onClick={() => resolverPedido("EFECTIVO")}>Pago en efectivo</div>
                                <div className='opcion-menu' onClick={() => resolverPedido("DATAFONO")}>Pago con tarjeta</div>
                            </div>

                        ) : (
                            <></>
                        )

                    }

                </div>
            </section>
        </>
    )
}

export default VerPedido