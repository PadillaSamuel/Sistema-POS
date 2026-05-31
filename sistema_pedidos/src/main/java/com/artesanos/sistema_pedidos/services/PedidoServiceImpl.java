package com.artesanos.sistema_pedidos.services;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Objects;
import java.util.Iterator;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.artesanos.sistema_pedidos.dtos.PagoDto;
import com.artesanos.sistema_pedidos.dtos.PedidoBodyDto;
import com.artesanos.sistema_pedidos.dtos.PedidoDto;
import com.artesanos.sistema_pedidos.dtos.ProductoDetalleDto;
import com.artesanos.sistema_pedidos.entities.DetallePedido;
import com.artesanos.sistema_pedidos.entities.Pago;
import com.artesanos.sistema_pedidos.entities.Pedido;
import com.artesanos.sistema_pedidos.entities.Producto;
import com.artesanos.sistema_pedidos.entities.Usuario;
import com.artesanos.sistema_pedidos.enums.MetodoPago;
import com.artesanos.sistema_pedidos.enums.EstadoPago;
import com.artesanos.sistema_pedidos.enums.EstadoPedido;
import com.artesanos.sistema_pedidos.repositories.PedidoRepository;
import com.artesanos.sistema_pedidos.repositories.ProductoRepository;
import com.artesanos.sistema_pedidos.repositories.UsuarioRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class PedidoServiceImpl implements PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    public PedidoServiceImpl(PedidoRepository pedidoRepository,
            UsuarioRepository usuarioRepository, ProductoRepository productoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.productoRepository = productoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoDto> listarPedidos() {
        return pedidoRepository.findAllPedidos();
    }

    @Override
    @Transactional
    public Optional<Pedido> save(PedidoDto pedidoDto, String usuarioNombre) {
        if (pedidoRepository.findPedidoPendienteByMesa(pedidoDto.getNumeroMesa()).size() > 0
                && pedidoDto.getNombreDomicilio() == null) {
            return Optional.empty();
        }
        Pedido pedido = new Pedido();

        List<DetallePedido> detallePedidos = new ArrayList<>();

        Integer total = 0;
        LocalDateTime fechaActual = LocalDateTime.now(ZoneId.of("America/Bogota"))
                .truncatedTo(ChronoUnit.MINUTES);
        for (ProductoDetalleDto i : pedidoDto.getProductos()) {

            DetallePedido detallePedido = new DetallePedido();
            Producto prodOptional = productoRepository.findByNombreProducto(i.getNombreProducto()).orElseThrow();

            int subtotal = i.getCantidadProducto() * prodOptional.getPrecio();

            detallePedido.setProducto(prodOptional);
            detallePedido.setCantidadProducto(i.getCantidadProducto());
            detallePedido.setPedido(pedido);
            detallePedido.setPrecioMomento(prodOptional.getPrecio());
            detallePedido.setSubtotalPedido(subtotal);
            detallePedido.setPeticionCliente(i.getPeticionCliente());
            detallePedido.setFechaModificacion(fechaActual);
            total += subtotal;

            detallePedidos.add(detallePedido);
        }

        Optional<Usuario> usuario = usuarioRepository.findByNombre(usuarioNombre);

        pedido.setUsuario(usuario.orElseThrow());
        pedido.setNumeroMesa(pedidoDto.getNumeroMesa());
        pedido.setFechaPedido(LocalDateTime.now(ZoneId.of("America/Bogota")));
        pedido.setEstadoPedido(EstadoPedido.PENDIENTE);
        pedido.setDetallesPedido(detallePedidos);
        pedido.setTotalPedido(total);
        pedido.setNombreDomicilio(pedidoDto.getNombreDomicilio());
        pedido.setEstadoPago(EstadoPago.PENDIENTE);
        pedido.setNumeroCliente(pedidoDto.getNumeroCliente());

        return Optional.of(pedidoRepository.save(pedido));

    }

    @Transactional
    @SuppressWarnings("null")
    @Override
    public Optional<Pedido> actualizarEstadoPedido(Integer id, String estado, String estadoPago) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedido.setEstadoPedido(EstadoPedido.fromString(estado));
            pedido.setEstadoPago(EstadoPago.fromString(estadoPago));
            return pedidoRepository.save(pedido);
        });
    }

    @Transactional
    @SuppressWarnings("null")
    @Override

public Optional<Pedido> actualizarPedido(Integer id, PedidoBodyDto pedidoBodyDto) {
    return pedidoRepository.findById(id).map(pedido -> {

        if (pedidoBodyDto.getNumeroMesa() != null) {
            pedido.setNumeroMesa(pedidoBodyDto.getNumeroMesa());
        }
        if (pedidoBodyDto.getNombreDomicilio() != null) {
            pedido.setNombreDomicilio(pedidoBodyDto.getNombreDomicilio());
            pedido.setNumeroCliente(pedidoBodyDto.getNumeroCliente());
        }

        if (pedidoBodyDto.getProductos() == null) {
            return pedidoRepository.save(pedido);
        }

        LocalDateTime fechaActual = LocalDateTime.now(ZoneId.of("America/Bogota"))
                                                 .truncatedTo(ChronoUnit.MINUTES);

        List<ProductoDetalleDto> dtosEntrantes = new ArrayList<>(pedidoBodyDto.getProductos());
        
        int totalAcumulado = 0;

        Iterator<DetallePedido> iterator = pedido.getDetallesPedido().iterator();
        
        while (iterator.hasNext()) {
            DetallePedido detalleExistente = iterator.next();
            String nombreProductoExistente = detalleExistente.getProducto().getNombreProducto();

            Optional<ProductoDetalleDto> dtoMatch = dtosEntrantes.stream()
                    .filter(dto -> dto.getNombreProducto().equalsIgnoreCase(nombreProductoExistente))
                    .findFirst();

            if (dtoMatch.isPresent()) {
                ProductoDetalleDto dto = dtoMatch.get();
                
                boolean cambioCantidad = !detalleExistente.getCantidadProducto().equals(dto.getCantidadProducto());
                boolean cambioPeticion = !Objects.equals(detalleExistente.getPeticionCliente(), dto.getPeticionCliente());

                int nuevoSubtotal = dto.getCantidadProducto() * detalleExistente.getProducto().getPrecio();

                if (cambioCantidad || cambioPeticion) {
                    detalleExistente.setCantidadProducto(dto.getCantidadProducto());
                    detalleExistente.setPeticionCliente(dto.getPeticionCliente());
                    detalleExistente.setSubtotalPedido(nuevoSubtotal);
                    detalleExistente.setFechaModificacion(fechaActual); 
                }

                totalAcumulado += nuevoSubtotal;
                dtosEntrantes.remove(dto); 

            } else {
                iterator.remove(); 
            }
        }

        for (ProductoDetalleDto dtoNuevo : dtosEntrantes) {
            Producto prod = productoRepository.findByNombreProducto(dtoNuevo.getNombreProducto())
                    .orElseThrow(() -> new EntityNotFoundException("Producto no encontrado: " + dtoNuevo.getNombreProducto()));

            int subtotal = dtoNuevo.getCantidadProducto() * prod.getPrecio();

            DetallePedido nuevoDetalle = new DetallePedido();
            nuevoDetalle.setPedido(pedido);
            nuevoDetalle.setProducto(prod);
            nuevoDetalle.setCantidadProducto(dtoNuevo.getCantidadProducto());
            nuevoDetalle.setPrecioMomento(prod.getPrecio());
            nuevoDetalle.setSubtotalPedido(subtotal);
            nuevoDetalle.setPeticionCliente(dtoNuevo.getPeticionCliente());
            nuevoDetalle.setFechaModificacion(fechaActual); 

            totalAcumulado += subtotal;
            pedido.getDetallesPedido().add(nuevoDetalle);
        }

        pedido.setTotalPedido(totalAcumulado);
        return pedidoRepository.save(pedido);
    });
}
    @Override
    @Transactional(readOnly = true)
    public List<PedidoDto> findByFechaPedidoBetweenAndEstadoPedido(LocalDateTime inicio, LocalDateTime fin) {
        if (inicio == null || fin == null) {
            throw new IllegalArgumentException("Las fechas de inicio y fin no pueden ser nulas");
        }
        if (inicio.isAfter(fin)) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha fin");
        }
        return pedidoRepository.findByFechaPedidoBetweenAndEstadoPedido(inicio, fin, EstadoPedido.RESUELTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoDto> findByFechaPedidoBetweenAndEstadoPedidoAnulado(LocalDateTime inicio, LocalDateTime fin) {
        if (inicio == null || fin == null) {
            throw new IllegalArgumentException("Las fechas de inicio y fin no pueden ser nulas");
        }
        if (inicio.isAfter(fin)) {
            throw new IllegalArgumentException("La fecha de inicio no puede ser posterior a la fecha fin");
        }
        return pedidoRepository.findByFechaPedidoBetweenAndEstadoPedido(inicio, fin, EstadoPedido.CANCELADO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoDto> findEstadoPedidoResuelto() {
        return pedidoRepository.findByEstadoPedido(EstadoPedido.RESUELTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PedidoDto> findEstadoPedidoAnulado() {
        return pedidoRepository.findByEstadoPedido(EstadoPedido.CANCELADO);
    }


    public Optional<Pedido> procesarPagos(Integer idPedido, List<PagoDto> pagosRecibidos) {
        return pedidoRepository.findById(idPedido).map(pedido -> {

            if (pagosRecibidos == null || pagosRecibidos.isEmpty()) {
                throw new IllegalArgumentException("Debe enviar al menos un método de pago");
            }

            if (pedido.getTotalPedido() == null || pedido.getTotalPedido() <= 0) {
                throw new IllegalArgumentException("El pedido no tiene un total válido para procesar pagos");
            }

            Integer sumaPagos = 0;

            pedido.getPagos().clear();

            for (PagoDto dto : pagosRecibidos) {
                MetodoPago metodo = MetodoPago.fromString(dto.getMetodoPago());

                if (dto.getMonto() == null || dto.getMonto() <= 0) {
                    throw new IllegalArgumentException("El monto debe ser un valor positivo");
                }

                Pago nuevoPago = new Pago();
                nuevoPago.setMetodoPago(metodo);
                nuevoPago.setMonto(dto.getMonto());
                pedido.addPago(nuevoPago);
                sumaPagos += dto.getMonto();
            }

            if (!sumaPagos.equals(pedido.getTotalPedido())) {
                throw new IllegalArgumentException(
                        "El monto total de los pagos ($" + sumaPagos +
                                ") no coincide con el total del pedido ($" + pedido.getTotalPedido() + ")"
                );
            }

            pedido.setEstadoPedido(EstadoPedido.RESUELTO);
            pedido.setEstadoPago(EstadoPago.PAGADO);

            return pedidoRepository.save(pedido);
        });
    }
}
