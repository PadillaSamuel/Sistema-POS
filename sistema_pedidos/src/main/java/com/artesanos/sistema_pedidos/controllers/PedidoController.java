package com.artesanos.sistema_pedidos.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.artesanos.sistema_pedidos.dtos.PagoDto;
import com.artesanos.sistema_pedidos.dtos.PedidoBodyDto;
import com.artesanos.sistema_pedidos.dtos.PedidoDto;
import com.artesanos.sistema_pedidos.dtos.PedidoPagoDto;
import com.artesanos.sistema_pedidos.dtos.ProductoDto;
import com.artesanos.sistema_pedidos.entities.Pedido;
import com.artesanos.sistema_pedidos.services.PedidoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/pedidos")
@Tag(name = "Pedidos", description = "Gestión de los Pedidos")
public class PedidoController {
    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Pedidos con estado pendiente encontrados", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = ProductoDto.class))))
    })
    @Operation(summary = "Obtener los pedidos")
    @GetMapping("/listar")
    @PreAuthorize("hasAnyAuthority('ROLE_CAJA', 'ROLE_MESERA')")
    public ResponseEntity<List<PedidoDto>> getPedidos() {
        List<PedidoDto> pedidos = pedidoService.listarPedidos();

        return ResponseEntity.ok().body(pedidos);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "409", description = "Intentar crear pedido en mesa que aun tiene uno pendiente", content = @Content),
            @ApiResponse(responseCode = "200", description = "Pedido creado")
    })
    @Operation(summary = "Crear pedidos")
    @PostMapping("/crear/{nombreUsuario}")
    @PreAuthorize("hasAnyAuthority('ROLE_CAJA', 'ROLE_MESERA')")
    public ResponseEntity<?> postPedido(@Valid @RequestBody PedidoDto pedidoDto, @PathVariable String nombreUsuario) {
        Optional<Pedido> pedido = pedidoService.save(pedidoDto, nombreUsuario);
        PedidoDto response = null;
        if (pedido.isPresent()) {
            response = new PedidoDto();
            response.setId(pedido.get().getId());
        }
        if (pedido.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                    "La mesa ya tiene un pedido pendiente, si requiere agregar productos actualice el pedido pendiente");
        }
        return ResponseEntity.ok().body(response);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Domicilio creado")
    })
    @Operation(summary = "Crear pedido domicilio")
    @PostMapping("/crear/domicilio/{nombreUsuario}")
    @PreAuthorize("hasAnyAuthority('ROLE_CAJA', 'ROLE_MESERA')")
    public ResponseEntity<?> postPedidoDomicilio(@Valid @RequestBody PedidoDto pedidoDto, @PathVariable String nombreUsuario) {
        Optional<Pedido> pedido = pedidoService.save(pedidoDto, nombreUsuario);
        PedidoDto response = null;
        if (pedido.isPresent()) {
            response = new PedidoDto();
            response.setId(pedido.get().getId());
        }
        if (pedido.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    "No se pudo crear el domicilio");
        }
        return ResponseEntity.ok().body(response);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "404", description = "Intentar actualizar pedido con id no existente", content = @Content),
            @ApiResponse(responseCode = "200", description = "Pedido actualizado")
    })
    @Operation(summary = "Actualizar pedido por id")
    @PutMapping("/actualizar/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_CAJA', 'ROLE_MESERA')")
    public ResponseEntity<?> putPedido(@PathVariable Integer id, @Valid @RequestBody PedidoBodyDto pedidoDto) {
        if (pedidoService.actualizarPedido(id, pedidoDto).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No existe pedido con ese id");
        }
        return ResponseEntity.ok().build();
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "404", description = "Intentar actualizar pedido con id no existente", content = @Content),
            @ApiResponse(responseCode = "200", description = "Estado de pedido actualizado")
    })
    @Operation(summary = "Actualizar estado y metodo de pago de pedido por id")
    @PutMapping("/actualizar/{id}/{estado}/{metodoPago}")
    @PreAuthorize("hasAnyAuthority('ROLE_CAJA', 'ROLE_MESERA')")
    public ResponseEntity<?> putEstadoPedido(@PathVariable Integer id, @PathVariable String estado,
            @PathVariable String metodoPago) {
        return pedidoService.actualizarEstadoPedido(id, estado.toUpperCase(), metodoPago.toUpperCase())
                .map(p -> ResponseEntity.ok().build())
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());

    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "404", description = "No existen pedidos para esas fechas", content = @Content),
            @ApiResponse(responseCode = "200", description = "Pedidos con pagos obtenidos")
    })
    @Operation(summary = "Buscar pedidos resueltos con información de pagos para cierre de caja")
    @GetMapping("/resueltos/cierre/pagos/{inicio}/{fin}")
    @PreAuthorize("hasAuthority('ROLE_CAJA')")
    public ResponseEntity<List<PedidoPagoDto>> getPedidosConPagosPorFecha(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        LocalDateTime fechaInicio = inicio.atStartOfDay();
        LocalDateTime fechaFin = fin.atTime(LocalTime.MAX);
        List<PedidoPagoDto> pedidos = pedidoService.findPedidosConPagosByFecha(fechaInicio, fechaFin, "RESUELTO");
        if (pedidos.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pedidos);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "404", description = "No existen pedidos para esas fechas", content = @Content),
            @ApiResponse(responseCode = "200", description = "Pedidos Anulados obtenidos")
    })
    @Operation(summary = "Buscar los pedidos Anulados en un rango de fechas")
    @GetMapping("/anulados/{inicio}/{fin}")
    @PreAuthorize("hasAuthority('ROLE_CAJA')")
    public ResponseEntity<List<PedidoDto>> getPedidosAnuladosPorFecha(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        LocalDateTime fechaInicio = inicio.atStartOfDay();
        LocalDateTime fechaFin = fin.atTime(LocalTime.MAX);
        List<PedidoDto> pedidos = pedidoService.findByFechaPedidoBetweenAndEstadoPedidoAnulado(fechaInicio, fechaFin);
        if (pedidos.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pedidos);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "404", description = "No hay pedidos pagados", content = @Content),
            @ApiResponse(responseCode = "200", description = "Pedidos Resueltos obtenidos")
    })
    @Operation(summary = "Buscar los pedidos Resueltos (lookup por id desde ver_pedido)")
    @GetMapping("/resueltos")
    @PreAuthorize("hasAuthority('ROLE_CAJA')")
    public ResponseEntity<List<PedidoDto>> getPedidosResueltos() {
        List<PedidoDto> pedidos = pedidoService.findEstadoPedidoResuelto();
        if (pedidos.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pedidos);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "400", description = "El monto no cubre el total", content = @Content),
            @ApiResponse(responseCode = "404", description = "Pedido no encontrado", content = @Content),
            @ApiResponse(responseCode = "200", description = "Pedido pagado exitosamente")
    })
    @Operation(summary = "Pagar un pedido con múltiples métodos de pago")
    @PutMapping("/pagar/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_CAJA', 'ROLE_MESERA')")
    public ResponseEntity<?> pagarPedido(@PathVariable Integer id, @Valid @RequestBody List<PagoDto> pagos) {
        try {
            return pedidoService.procesarPagos(id, pagos)
                    .map(p -> ResponseEntity.ok().body("Pedido pagado correctamente"))
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
