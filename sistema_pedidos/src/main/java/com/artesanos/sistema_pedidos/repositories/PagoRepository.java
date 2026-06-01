package com.artesanos.sistema_pedidos.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.artesanos.sistema_pedidos.entities.Pago;

public interface PagoRepository extends JpaRepository<Pago, Integer>{
    public List<Pago> findByPedidoIdIn(List<Integer> pedidosIds);
}
