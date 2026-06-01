package com.artesanos.sistema_pedidos.controllers;

import org.springframework.web.bind.annotation.RestController;

import com.artesanos.sistema_pedidos.dtos.MetricaDTO;
import com.artesanos.sistema_pedidos.services.PedidoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/metricas")
@Tag(name = "Métrica", description = "Envia información de métricas")

public class MetricaController {

    PedidoService pedidoService;

    public MetricaController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "404", description = "No hay métricas para ese año", content = @Content),
            @ApiResponse(responseCode = "200", description = "Métricas encontradas")
    })
    @Operation(summary = "Obtener métricas por año recibido")
    @PreAuthorize("hasAuthority('ROLE_CAJA')")
    @GetMapping("/anhos/{anho}")
    public ResponseEntity<Optional<MetricaDTO>> meetricasAnho(@PathVariable Integer anho) {
        LocalDateTime inicioAnho = LocalDateTime.of(anho, 1, 1, 0, 0, 0);
        LocalDateTime finAnho = LocalDateTime.of(anho + 1, 1, 1, 0, 0, 0);

        Optional<MetricaDTO> metricas = pedidoService.findMetricasPedidosAnho(inicioAnho, finAnho, "RESUELTO");
        if (metricas.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok().body(metricas);
    }

}
