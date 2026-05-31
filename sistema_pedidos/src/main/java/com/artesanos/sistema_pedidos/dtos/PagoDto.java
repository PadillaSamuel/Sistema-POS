package com.artesanos.sistema_pedidos.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PagoDto {
    @NotBlank(message = "El método de pago es requerido")
    private String metodoPago;

    @NotNull(message = "El monto es requerido")
    @Positive(message = "El monto debe ser un valor positivo")
    private Integer monto;
}