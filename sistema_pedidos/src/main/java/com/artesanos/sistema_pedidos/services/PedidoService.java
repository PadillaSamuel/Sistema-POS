package com.artesanos.sistema_pedidos.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import com.artesanos.sistema_pedidos.dtos.MetricaDTO;
import com.artesanos.sistema_pedidos.dtos.PagoDto;
import com.artesanos.sistema_pedidos.dtos.PedidoBodyDto;
import com.artesanos.sistema_pedidos.dtos.PedidoDto;
import com.artesanos.sistema_pedidos.dtos.PedidoPagoDto;
import com.artesanos.sistema_pedidos.entities.Pedido;
import com.artesanos.sistema_pedidos.enums.EstadoPedido;

public interface PedidoService {
    public List<PedidoDto> listarPedidos();

    public Optional<Pedido> save(PedidoDto pedido, String usuarioNombre);

    public Optional<Pedido> actualizarEstadoPedido(Integer id, String estado, String estadoPago);

    public Optional<Pedido> actualizarPedido(Integer id, PedidoBodyDto pedidoBodyDto);

    public List<PedidoDto> findByFechaPedidoBetweenAndEstadoPedido(LocalDateTime inicio, LocalDateTime fin);

    public List<PedidoDto> findByFechaPedidoBetweenAndEstadoPedidoAnulado(LocalDateTime inicio, LocalDateTime fin);

    public List<PedidoDto> findEstadoPedidoResuelto();

    public List<PedidoDto> findEstadoPedidoAnulado();

    public Optional<Pedido> procesarPagos(Integer idPedido, List<PagoDto> pagosRecibidos);

    public List<PedidoPagoDto> findPedidosConPagosByFecha(LocalDateTime inicio, LocalDateTime fin, String estado);

    public Optional<MetricaDTO> findMetricasPedidosAnho(LocalDateTime inicio, LocalDateTime fin, EstadoPedido estado);
}
