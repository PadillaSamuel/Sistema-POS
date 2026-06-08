package com.artesanos.sistema_pedidos.dtos;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ProductoDetalleDto {
    @NotBlank(message = "El nombre del producto es requerido")
    String nombreProducto;

    @NotNull(message = "La cantidad es requerida")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    Integer cantidadProducto;

    Integer subtotalPedido;
    Integer precioMomento;
    String peticionCliente;
    LocalDateTime fechaModificacion;
    boolean modificado;

    public ProductoDetalleDto(String nombre, Integer cantidad, Integer precio, Integer subtotal,
            String peticionCliente, LocalDateTime fechaModificacion, boolean modificado) {
        this.nombreProducto = nombre;
        this.cantidadProducto = cantidad;
        this.precioMomento = precio;
        this.subtotalPedido = subtotal;
        this.peticionCliente = peticionCliente;
        this.fechaModificacion = fechaModificacion;
        this.modificado = modificado;
    }
}
