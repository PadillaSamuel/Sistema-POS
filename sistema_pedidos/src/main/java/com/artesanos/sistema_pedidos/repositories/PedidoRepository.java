package com.artesanos.sistema_pedidos.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.artesanos.sistema_pedidos.dtos.PedidoDto;
import com.artesanos.sistema_pedidos.entities.Pedido;
import com.artesanos.sistema_pedidos.enums.EstadoPedido;

import org.springframework.stereotype.Repository;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Integer> {

    @Query("""
            select p from Pedido p where p.numeroMesa =?1 and p.estadoPedido ='PENDIENTE'
                """)
    public List<Pedido> findPedidoPendienteByMesa(Integer numeroMesa);

    @Query("""
                select new com.artesanos.sistema_pedidos.dtos.PedidoDto(
                    p.id,
                    p.numeroMesa,
                    p.nombreDomicilio,
                    p.numeroCliente
                )
                from Pedido p
                where p.estadoPedido = 'PENDIENTE'
            """)
    public List<PedidoDto> findAllPedidos();

    @Query("""
            select new com.artesanos.sistema_pedidos.dtos.PedidoDto(
                                p.id,
                                p.totalPedido,
                                p.numeroMesa,
                                p.nombreDomicilio,
                                p.estadoPago,
                                p.numeroCliente
                            ) from Pedido p where p.fechaPedido between ?1 and ?2 and p.estadoPedido = ?3
                        """)
    public List<PedidoDto> findByFechaPedidoBetweenAndEstadoPedido(LocalDateTime inicio, LocalDateTime fin,
            EstadoPedido estadoPedido);

    @Query("""
            select new com.artesanos.sistema_pedidos.dtos.PedidoDto(
                       p.id,
                       p.totalPedido,
                       p.numeroMesa,
                       p.nombreDomicilio,
                       p.estadoPago,
                       p.numeroCliente
                   ) from Pedido p where p.estadoPedido = ?1
            """)
    List<PedidoDto> findByEstadoPedido(EstadoPedido estadoPedido);
}
