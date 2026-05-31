import { useNavigate } from 'react-router-dom'
import './boton_pedido.css'

const BotonPedido = ({ num_pedido, num_mesa, total, ruta, nombreDomi }) => {
    const navigate = useNavigate()
    return (
        <>
            <div className='boton_pedido_cont' onClick={() => { navigate(ruta) }}>
                <div>
                    {
                        nombreDomi ? (
                            <>
                                <h3>Pedido {num_pedido}</h3>
                                <h3>{nombreDomi}</h3>
                            </>

                        ) : (
                            <>
                                <h3>Pedido {num_pedido}</h3>
                                <h3>Mesa N.{num_mesa}</h3>
                            </>

                        )
                    }

                </div>
            </div>
        </>
    )
}

export default BotonPedido