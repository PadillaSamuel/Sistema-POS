import './ver_pedido.css'
import FilaPedido from '../components/fila_pedido'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest } from '../services/api';
import { useEffect, useRef, useState } from 'react';
import { formateador } from './ver_ventas';
import { useReactToPrint } from "react-to-print";
import { toast } from 'react-toastify';


const VerPedido = ({ n_pedido, n_mesa }) => {
    const [pedido, setPedido] = useState([])
    const [cantidad, setCantidad] = useState(0)
    const { id, mesa, estado, domi } = useParams();
    const [total, setTotal] = useState(0)
    const comandaRef = useRef();
    const navigate = useNavigate();
    const [celular, setCelular] = useState(null)
    const [showModalPago, setShowModalPago] = useState(false)
    const [pagoMetodos, setPagoMetodos] = useState({
        EFECTIVO: '',
        TRANSFERENCIA: '',
        DATAFONO: ''
    })

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

    const anularPedido = async () => {
        return apiRequest(`/api/pedidos/actualizar/${id}/CANCELADO/ANULADO`, {
            metodo: "PUT"
        })
    }

    const procesarPagos = async (pagos) => {
        return apiRequest(`/api/pedidos/pagar/${id}`, {
            metodo: 'PUT',
            body: pagos
        })
    }

    const cancelarPedido = async () => {
        const tmp = await anularPedido();
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

    const calcularSumaPagos = () => {
        const valores = Object.values(pagoMetodos).map(v => parseInt(v) || 0)
        return valores.reduce((sum, val) => sum + val, 0)
    }

    const validarYEnviarPagos = async () => {
        const sumaPagos = calcularSumaPagos()

        if (sumaPagos === 0) {
            toast.error("Debe ingresar al menos un método de pago");
            return;
        }

        if (sumaPagos !== total) {
            toast.error(`La suma de los pagos (${formateador.format(sumaPagos)}) no coincide con el total del pedido (${formateador.format(total)})`);
            return;
        }

        const pagos = []
        if (pagoMetodos.EFECTIVO && parseInt(pagoMetodos.EFECTIVO) > 0) {
            pagos.push({ metodoPago: "EFECTIVO", monto: parseInt(pagoMetodos.EFECTIVO) })
        }
        if (pagoMetodos.TRANSFERENCIA && parseInt(pagoMetodos.TRANSFERENCIA) > 0) {
            pagos.push({ metodoPago: "TRANSFERENCIA", monto: parseInt(pagoMetodos.TRANSFERENCIA) })
        }
        if (pagoMetodos.DATAFONO && parseInt(pagoMetodos.DATAFONO) > 0) {
            pagos.push({ metodoPago: "DATAFONO", monto: parseInt(pagoMetodos.DATAFONO) })
        }

        try {
            await procesarPagos(pagos)
            toast.success("Pago procesado correctamente");
            setShowModalPago(false)
            navigate("/pedidos");
        } catch (error) {
            toast.error(`Error al procesar pago: ${error.message}`);
        }
    }

    const handlePagoMetodoChange = (metodo, value) => {
        const numericValue = value.replace(/\D/g, '')
        setPagoMetodos(prev => ({
            ...prev,
            [metodo]: numericValue
        }))
    }

    const abrirModalPago = () => {
        setPagoMetodos({ EFECTIVO: '', TRANSFERENCIA: '', DATAFONO: '' })
        setShowModalPago(true)
    }

    const cerrarModalPago = () => {
        setShowModalPago(false)
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
                                <button className='fila-boton-dos' onClick={abrirModalPago}>Confirmar Pago</button>
                            </div>
                            <div>
                                <button className='fila-boton-dos' onClick={impresionFac}>Imprimir Comanda</button>
                            </div>
                        </>
                    )
                    }

                </div>
            </section>

            {showModalPago && (
                <div className='modal-pago-overlay' onClick={(e) => {
                    if (e.target.className === 'modal-pago-overlay') cerrarModalPago()
                }}>
                    <div className='modal-pago'>
                        <h2 className='modal-pago-titulo'>Confirmar Pago</h2>

                        <div className='modal-pago-campos'>
                            <div className='modal-pago-campo'>
                                <label>EFECTIVO</label>
                                <input
                                    type='text'
                                    inputMode='numeric'
                                    placeholder='0'
                                    value={pagoMetodos.EFECTIVO}
                                    onChange={(e) => handlePagoMetodoChange('EFECTIVO', e.target.value)}
                                />
                            </div>

                            <div className='modal-pago-campo'>
                                <label>TRANSFERENCIA</label>
                                <input
                                    type='text'
                                    inputMode='numeric'
                                    placeholder='0'
                                    value={pagoMetodos.TRANSFERENCIA}
                                    onChange={(e) => handlePagoMetodoChange('TRANSFERENCIA', e.target.value)}
                                />
                            </div>

                            <div className='modal-pago-campo'>
                                <label>DATAFONO</label>
                                <input
                                    type='text'
                                    inputMode='numeric'
                                    placeholder='0'
                                    value={pagoMetodos.DATAFONO}
                                    onChange={(e) => handlePagoMetodoChange('DATAFONO', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className='modal-pago-total'>
                            <span>Total: {formateador.format(total)}</span>
                        </div>

                        <div className={`modal-pago-suma ${calcularSumaPagos() === total ? 'ok' : ''}`}>
                            <span>Pago: {formateador.format(calcularSumaPagos())}</span>
                            {calcularSumaPagos() !== total && calcularSumaPagos() > 0 && (
                                <span className='modal-pago-diferencia'>
                                    {calcularSumaPagos() > total ? 'Exceso' : 'Faltante'}: {formateador.format(Math.abs(total - calcularSumaPagos()))}
                                </span>
                            )}
                        </div>

                        <div className='modal-pago-botones'>
                            <button className='modal-pago-btn-cancelar' onClick={cerrarModalPago}>Cancelar</button>
                            <button className='modal-pago-btn-confirmar' onClick={validarYEnviarPagos}>Confirmar Pago</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default VerPedido