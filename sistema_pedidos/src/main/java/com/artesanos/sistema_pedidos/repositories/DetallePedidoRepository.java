package com.artesanos.sistema_pedidos.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.artesanos.sistema_pedidos.dtos.ProductoDetalleDto;
import com.artesanos.sistema_pedidos.entities.DetallePedido;
@Repository
public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {
    @Query("""
            select new com.artesanos.sistema_pedidos.dtos.ProductoDetalleDto(
            dt.producto.nombreProducto,
            dt.cantidadProducto,
            dt.precioMomento,
            dt.subtotalPedido,
            dt.peticionCliente ,
            dt.fechaModificacion,
            dt.modificado
            )
            from DetallePedido dt
            where dt.pedido.id=?1
        """)
    public List<ProductoDetalleDto> findProductosDePedido(Integer id);

    List<DetallePedido> findByPedidoIdAndModificadoTrue(Integer pedidoId);
}
