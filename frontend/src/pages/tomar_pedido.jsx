import './tomar_pedido.css'
import arrow from '../assets/flecha.png'
import FilaTomarPedido from '../components/fila_tomar_pedido'
import { useEffect, useState } from 'react'
import { apiRequest } from '../services/api'
import { useNavigate, useParams } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { formateador } from './ver_ventas'
import { toast } from 'react-toastify';
const TomarPedido = () => {

    const { id, mesa, domi } = useParams();
    const token = localStorage.getItem("token")
    const decode = jwtDecode(token);
    const nombre = decode.sub
    const navigate = useNavigate()





    const [visible, setVisible] = useState(false)

    const [digitado, setDigitado] = useState("")
    const [productos, setProductos] = useState([])
    const [pedido, setPedido] = useState([])
    const [total, setTotal] = useState(0)
    const [mesaPedido, setMesaPedido] = useState(id != undefined ? (mesa === 0 ? undefined : mesa) : null)
    const [nombreDomicilio, setNombreDomicilio] = useState(id != undefined ? domi : null)
    const [celCliente, setCelCliente] = useState(null)


    useEffect(() => {
        if (!id) return;

        apiRequest(`/api/detallePedido/${id}`, {
            metodo: "GET"
        }).then(data => {
            setPedido(data)
            console.log(data)
        })


    }, [id])

    const listarPedidos = async () => {
        return apiRequest('/api/pedidos/listar', {
            metodo: 'GET'
        })
    }

    useEffect(() => {
        const funTmp = async () => {
            if (id != undefined && domi != undefined) {
                const pedis = await listarPedidos()
                const pedi = pedis.find(p => p.id === Number(id))
                const result = pedi != null ? pedi.numeroCliente : null
                setCelCliente(result)
            }
        }
        funTmp()
    }, [])


    const actDigitado = (e) => {
        setDigitado(e.target.value)
    }

    const buscarProductos = async () => {
        return apiRequest(`/api/producto/listar/${digitado}`, {
            metodo: "GET"
        })
    }

    const anularPedido = async () => {
        return apiRequest(`/api/pedidos/actualizar/${id}/CANCELADO/NO_PAGO`, {
            metodo: "PUT"
        })
    }

    useEffect(() => {
        const traerProductos = async () => {
            if (digitado != "") {
                const tmp = await buscarProductos()
                setProductos(tmp)

            }
        }
        traerProductos()

    }, [digitado])

    const elegirProducto = (producto) => {
        const existe = pedido.some(p => p.nombreProducto === producto.nombreProducto);
        if (!existe) {
            setPedido(pedido => [...pedido, {
                indice: producto.id,
                nombreProducto: producto.nombreProducto,
                cantidadProducto: 1,
                precioMomento: producto.precio,
                subtotalPedido: producto.precio * 1,
                peticionCliente: ""
            }])
            setVisible(false)
        }

    }

    const funcionDatosHijo = (cantidad, index, subtotal) => {

        setPedido(tmp => (
            tmp
                .map(i =>

                    i.nombreProducto === index ?
                        { ...i, cantidadProducto: cantidad, subtotalPedido: subtotal }
                        : i

                )

                .filter(t => t.cantidadProducto > 0)
        ))

    }

    useEffect(() => {

        const calcularTotal = () => {
            const suma = pedido.reduce(
                (acum, p) => acum + p.subtotalPedido,
                0
            )
            setTotal(suma)
        }
        calcularTotal()
    }, [pedido])


    const confirmarPedido = async () => {
        if (mesaPedido != null) {
            return apiRequest(`/api/pedidos/crear/${nombre}`, {
                metodo: "POST",
                body: {
                    numeroMesa: mesaPedido,
                    total: total,
                    productos: pedido.map(p => ({
                        nombreProducto: p.nombreProducto,
                        cantidadProducto: p.cantidadProducto,
                        subtotalPedido: p.subtotalPedido,
                        precioMomento: p.precioMomento,
                        peticionCliente: p.peticionCliente
                    }))
                }
            })
        } else {
            return apiRequest(`/api/pedidos/crear/domicilio/${nombre}`, {
                metodo: "POST",
                body:
                {
                    numeroMesa: 0,
                    total: total,
                    productos: pedido.map(p => ({
                        nombreProducto: p.nombreProducto,
                        cantidadProducto: p.cantidadProducto,
                        subtotalPedido: p.subtotalPedido,
                        precioMomento: p.precioMomento,
                        peticionCliente: p.peticionCliente
                    })),
                    nombreDomicilio: nombreDomicilio,
                    numeroCliente: celCliente
                }
            })
        }
    }


    const actualizarPedido = async () => {
        return apiRequest(`/api/pedidos/actualizar/${id}`, {
            metodo: "PUT",
            body:
                mesaPedido != undefined ? {
                    numeroMesa: mesaPedido,
                    productos: pedido.map(p => ({
                        nombreProducto: p.nombreProducto,
                        cantidadProducto: p.cantidadProducto,
                        subtotalPedido: p.subtotalPedido,
                        precioMomento: p.precioMomento,
                        peticionCliente: p.peticionCliente
                    }
                    )
                    )
                } : {
                    numeroMesa: 0,
                    productos: pedido.map(p => ({
                        nombreProducto: p.nombreProducto,
                        cantidadProducto: p.cantidadProducto,
                        subtotalPedido: p.subtotalPedido,
                        precioMomento: p.precioMomento,
                        peticionCliente: p.peticionCliente
                    }
                    )
                    ),
                    nombreDomicilio: nombreDomicilio,
                    estadoPago: "NO_PAGO",
                    numeroCliente: celCliente
                }


        })
    }

    const subirPedido = async () => {
        if (pedido.length != 0) {
            if (id != undefined) {
                await actualizarPedido()
                imprimirComanda({
                    idPedido: id,
                    impresoraIp: import.meta.env.VITE_IMPRESORA_COCINA || "192.168.1.200",
                    numeroMesa: mesaPedido,
                    nombreDomicilio: nombreDomicilio,
                    productos: pedido.map(p => ({
                        nombreProducto: p.nombreProducto,
                        cantidadProducto: p.cantidadProducto,
                        subtotalPedido: p.subtotalPedido,
                        precioMomento: p.precioMomento,
                        peticionCliente: p.peticionCliente
                    }
                    ))
                })
                if (mesaPedido != null) {
                    navigate("/mesera");
                } else {
                    navigate("/gestionar-domis")
                }

                toast.success("¡Pedido actualizado con éxito!");
            } else {
                try {
                    const res_id = await confirmarPedido()

                    const pedidoImprimir = await apiRequest(`/api/detallePedido/${res_id.id}`, {
                        metodo: "GET"
                    })

                    imprimirComanda({
                        idPedido: res_id.id,
                        impresoraIp: import.meta.env.VITE_IMPRESORA_COCINA || "192.168.1.200",
                        numeroMesa: mesaPedido,
                        nombreDomicilio: nombreDomicilio,
                        productos: pedidoImprimir
                    })

                    if (mesaPedido != null) {
                        navigate("/mesera");
                    } else {
                        navigate("/gestionar-domis")
                    }
                    toast.success("¡Pedido confirmado con éxito!");
                } catch (error) {
                    toast.error(`${error.message}`);
                }
            }
        }


    }

    const cambiarMesa = (e) => {
        const valorOriginal = e.target.value;

        if (valorOriginal.trim() === '' || isNaN(valorOriginal)) {
            setMesaPedido(0);
            toast.error("¡Número de mesa inválido!", { toastId: "error-mesa" });
            return;
        }

        const numMesa = parseInt(valorOriginal, 10);

        if (numMesa <= 0 || numMesa > 100) {
            setMesaPedido(0);
            toast.error("Rango de mesa inválido (1-100)", { toastId: "error-mesa" });
            return;
        }
        setMesaPedido(numMesa);
    }

    const cambiarDomi = (e) => {
        const nameDomi = e.target.value;
        if (nameDomi === '.') {
            toast.error("Caracter inválido! Cambie el nombre del cliente ", { toastId: "error-nombre" });

        }
        setNombreDomicilio(nameDomi);


    }
    const cambiarCel = (e) => {
        const val = e.target.value;
        setCelCliente(val);
    }

    const cancelarPedido = async () => {
        const tmp = await anularPedido();
        navigate("/mesera");
    }

    const añadirDetalle = (nombre, peticion) => {
        setPedido(pedido => pedido.map(
            i => i.nombreProducto === nombre ?
                {
                    ...i, peticionCliente: peticion
                } : i

        ))
        console.log(peticion)
    }

    const imprimirComanda = async (cuerpo) => {
        return apiRequest('/api/impresora/comanda', {
            metodo: 'POST',
            body: cuerpo
        }
        )
    }

    return (
        <>
            <section className='tomar-pedido-sec'>
                {
                    visible && (
                        <div className='selector'>
                            <h1>Búsqueda</h1>
                            <form  >
                                <input onChange={actDigitado} type="text" placeholder='Ingrese un dato de búsqueda' className='input-selector' />
                                <div className='resultados'>
                                    {productos != null ? (
                                        productos.map((p, index) => {
                                            return (
                                                <div onClick={() => { elegirProducto(p) }} key={p.id} className='resultado'>{p.nombreProducto}</div>
                                            )


                                        })
                                    ) : (
                                        <p>No hay</p>
                                    )

                                    }

                                </div>
                            </form>
                            <button onClick={() => {
                                setVisible(false)
                            }} className='boton-busqueda'>Cancelar</button>
                        </div>
                    )
                }

                <div className='main'>
                    <div className='tomar-pedido-div-uno'>
                        <button className='tomar-pedido-boton-volver' onClick={() => {
                            if (id != undefined && domi != undefined) {
                                navigate(`/pedidos/${true}`)
                            } else {
                                if (domi != undefined) {
                                    navigate("/gestionar-domis")
                                } else {
                                    navigate("/mesera")
                                }

                            }

                        }}>
                            <img src={arrow} alt="" />
                        </button>
                    </div>
                    <div className='tomar-pedido-div-dos'>

                        {
                            id != undefined ? (
                                mesaPedido != undefined ? (
                                    <>
                                        <label htmlFor="" className='numero-mesa'>Número de mesa</label>
                                        <input type="text" className='input-mesa' onChange={cambiarMesa} value={mesaPedido} />
                                    </>

                                ) : (
                                    <>
                                        <div>
                                            <label htmlFor="" className='numero-mesa'>Nombre cliente</label>
                                            <input type="text" className='input-mesa' onChange={cambiarDomi} value={nombreDomicilio} />
                                        </div>
                                        <div>
                                            <label htmlFor="" className='label-cel'>Cel cliente</label>
                                            <input type="text" className='cel-cliente' placeholder='Cel' onChange={cambiarCel} value={celCliente}/>
                                        </div>


                                    </>

                                )



                            ) : (
                                domi != undefined ? (
                                    <>
                                        <div>
                                            <label htmlFor="" className='numero-mesa'>Nombre cliente</label>
                                            <input type="text" placeholder="Ingrese el nombre del cliente" className='input-mesa' onChange={cambiarDomi} />
                                        </div>
                                        <div>
                                            <label htmlFor="" className='label-cel'>Cel cliente</label>
                                            <input type="text" className='cel-cliente' placeholder='Cel' onChange={cambiarCel} />
                                        </div>

                                    </>

                                ) : (
                                    <>
                                        <label htmlFor="" className='numero-mesa'>Número de mesa</label>
                                        <input type="text" placeholder="Ingrese un número de mesa" className='input-mesa' onChange={cambiarMesa} />
                                    </>

                                )

                            )
                        }

                    </div>
                    <div className='tomar-pedido-div-tres'>

                        <div className='title-pedido-div-tres'>
                            <h3>Pedido</h3>
                        </div>

                        <div className='items-pedido'>

                            {
                                pedido.map((p, index) => (
                                    <FilaTomarPedido key={p.nombreProducto} nombre_producto={p.nombreProducto.charAt(0).toUpperCase() + p.nombreProducto.slice(1)} funcion={funcionDatosHijo} index={p.nombreProducto} precio={p.precioMomento} cantidad={p.cantidadProducto} addDetalle={añadirDetalle} detalle={p.peticionCliente} />
                                ))
                            }
                        </div>

                    </div>
                    <div className='tomar-pedido-div-cuatro'>
                        <button onClick={() => {
                            setVisible(true)
                        }}>Añadir producto</button>
                    </div>
                </div>

                <footer className='tomar-pedido-div-cinco'>
                    <div className='div-confirmar-pedido'>

                        {id != undefined ? (
                            mesaPedido != undefined ?
                                (
                                    <>
                                        <button className='button-confirmar-pedido' disabled={pedido.length === 0 || mesaPedido == 0 || mesaPedido == undefined || mesaPedido == null} onClick={subirPedido}>Confirmar pedido</button>
                                        <button className='button-anular-pedido' onClick={cancelarPedido}>Anular pedido</button>
                                    </>
                                ) : (
                                    <>
                                        <button className='button-confirmar-pedido' disabled={pedido.length === 0 || nombreDomicilio == '' || nombreDomicilio == '.'} onClick={subirPedido}>Confirmar pedido</button>
                                        <button className='button-anular-pedido' onClick={cancelarPedido}>Anular pedido</button>
                                    </>
                                )


                        ) : (
                            domi != undefined ?
                                (
                                    <button className='button-confirmar-pedido' disabled={pedido.length === 0 || nombreDomicilio == '' || nombreDomicilio == '.'} onClick={subirPedido}>Confirmar pedido</button>
                                ) : (
                                    <button className='button-confirmar-pedido' disabled={pedido.length === 0 || mesaPedido == 0 || mesaPedido == undefined || mesaPedido == null} onClick={subirPedido}>Confirmar pedido</button>
                                )

                        )

                        }

                    </div>

                    <h3 className='tomar-pedido-text-total'>Total</h3>
                    <h3>{formateador.format(total)}</h3>
                </footer>
            </section>

        </>
    )
}

export default TomarPedido