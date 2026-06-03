import { useEffect, useRef, useState } from 'react';
import './fila_tomar_pedido.css'
import { formateador } from '../lib/format';




const FilaTomarPedido = ({ nombre_producto, funcion, index, precio, cantidad, addDetalle, detalle }) => {



    const [cnt, setcnt] = useState(cantidad);
    const [valor, setvalor] = useState(cnt * precio)
    const secRef = useRef(null);
    const [pos, setPos] = useState(null);
    const [detalles, setDetalles] = useState([]);



    const incrementar = () => {
        setcnt((tmp) => tmp + 1);
        setvalor(precio * (cnt + 1))
        funcion(cnt + 1, index, (precio * (cnt + 1)))
    }
    const cambiar_subtotal = () => {
        setvalor(precio * cnt)
    }


    const decrementar = () => {
        setcnt((tmp) => Math.max(0, tmp - 1))
        setvalor(precio * (cnt - 1))
        funcion(cnt - 1, index, (precio * (cnt - 1)))
    }


    const enviarDetalle = (name, detail) => {
        addDetalle(name, detail)
    }
    return (
        <>
            <section className='fila-tomar-pedido-sec' ref={secRef}>
                <div className='fila-tomar-pedido-div-uno'>{cnt}</div>
                <div className='fila-tomar-pedido-div-dos' onClick={() => {
                    if (pos == null) {
                        setPos({
                            top: secRef.current.getBoundingClientRect().bottom + window.scrollY,
                            left: secRef.current.getBoundingClientRect().left + window.scrollX,
                            width: secRef.current.getBoundingClientRect().width
                        })
                    } else {
                        setPos(null)
                    }


                }}>{nombre_producto}</div>
                <div className='fila-tomar-pedido-div-tres' onClick={incrementar}>+</div>
                <div className='fila-tomar-pedido-div-cuatro' onClick={decrementar}>-</div>
                <div className='fila-tomar-pedido-div-cinco'>{formateador.format(valor)}</div>
            </section>

            {pos != null ? (
                <div className='div-add-details' style={{

                    top: pos.top,
                    left: pos.left,
                    width: pos.width
                }}>
                    <input className='inp-add-detail' type="text" onChange={(e) => enviarDetalle(index, e.target.value)} defaultValue={detalle} placeholder='Agrega detalles' />
                </div>
            ) : (
                <></>
            )

            }

        </>
    )
}

export default FilaTomarPedido