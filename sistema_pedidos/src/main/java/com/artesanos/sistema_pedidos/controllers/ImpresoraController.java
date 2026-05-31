package com.artesanos.sistema_pedidos.controllers;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.artesanos.sistema_pedidos.dtos.ComandaDto;
import com.artesanos.sistema_pedidos.dtos.FacturaDto;
import com.artesanos.sistema_pedidos.services.DetallePedidoService;
import com.artesanos.sistema_pedidos.services.networkPrinterService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping(path = "/api/impresora")
@Tag(name = "Impresora", description = "Envia informacion para imprimir")
public class ImpresoraController {
    private static final Logger log = LoggerFactory.getLogger(ImpresoraController.class);
    private final networkPrinterService networkPrinterService;
    private final DetallePedidoService detallePedidoService;

    public ImpresoraController(
            networkPrinterService networkPrinterService, DetallePedidoService detallePedidoService) {
        this.networkPrinterService = networkPrinterService;
        this.detallePedidoService = detallePedidoService;
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "500", description = "Error al imprimir factura, posible ip no encontrada", content = @Content),
            @ApiResponse(responseCode = "200", description = "Factura impresa")
    })
    @Operation(summary = "Enviar a imprimir factura")
    @PreAuthorize("hasAnyAuthority('ROLE_CAJA', 'ROLE_MESERA')")
    @PostMapping("/factura")
    public ResponseEntity<?> imprimirFactura(@RequestBody FacturaDto payload) {
        log.info("[FACTURA] Solicitud de impresion recibida - PedidoID: {}, IP: {}", payload.getIdPedido(), payload.getImpresoraIp());
        try {

            String printerIp = payload.getImpresoraIp();

            log.debug("[FACTURA] IP validada y aceptada: {}", printerIp);

            Map<String, Object> data = new HashMap<>();
            data.put("id", payload.getIdPedido());

            String mesa = payload.getNumeroMesa();
            data.put("mesa", (mesa == null || mesa.isBlank()) ? null : mesa);

            String domicilio = payload.getNombreDomicilio();
            data.put("nombreDomicilio", (domicilio == null || domicilio.isBlank()) ? null : domicilio);
            data.put("fecha", payload.getFechaFactura());
            data.put("pedido", payload.getProductos());
            data.put("total", payload.getTotal());
            String numeroCliente = payload.getNumeroCliente();
            data.put("numeroCliente", (numeroCliente == null || numeroCliente.isBlank()) ? null : numeroCliente);

            networkPrinterService.imprimirFactura(data, printerIp);

            return ResponseEntity.ok("Impresión enviada exitosamente a: " + printerIp);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error en el proceso de impresión: " + e.getMessage());
        }
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "500", description = "Error al imprimir comanda, posible ip no encontrada", content = @Content),
            @ApiResponse(responseCode = "200", description = "Comanda impresa")
    })
    @Operation(summary = "Enviar a imprimir Comanda")
    @PreAuthorize("hasAnyAuthority('ROLE_CAJA', 'ROLE_MESERA')")
    @PostMapping("/comanda")
    public ResponseEntity<?> imprimirComanda(@RequestBody ComandaDto payload) {
        log.info("[COMANDA] Solicitud de impresion recibida - PedidoID: {}, IP: {}", payload.getIdPedido(), payload.getImpresoraIp());
        try {
            String printerIp = payload.getImpresoraIp();

            log.debug("[COMANDA] IP validada y aceptada: {}", printerIp);

            Map<String, Object> data = new HashMap<>();
            data.put("id", payload.getIdPedido());

            String mesa = payload.getNumeroMesa();
            data.put("mesa", (mesa == null || mesa.isBlank()) ? null : mesa);

            String domicilio = payload.getNombreDomicilio();
            data.put("nombreDomicilio", (domicilio == null || domicilio.isBlank()) ? null : domicilio);

            data.put("pedido", detallePedidoService.getDetallesPedido(payload.getIdPedido()));
            networkPrinterService.imprimirCocina(data, printerIp);

            return ResponseEntity.ok("Impresión enviada exitosamente a: " + printerIp);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error en el proceso de impresión: " + e.getMessage());
        }
    }

}
