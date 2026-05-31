package com.artesanos.sistema_pedidos.dtos;

import java.util.List;

import com.artesanos.sistema_pedidos.enums.EstadoPago;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PedidoBodyDto {
    @Min(value = 1, message = "El número de mesa debe ser mayor a 0")
    Integer numeroMesa;

    @NotEmpty(message = "La lista de productos no puede estar vacía")
    List<ProductoDetalleDto> productos;

    String nombreDomicilio;
    EstadoPago estadoPago;
    String numeroCliente;

    public PedidoBodyDto(Integer numeroMesa, List<ProductoDetalleDto> productoDtos) {
        this.numeroMesa = numeroMesa;
        this.productos = productoDtos;
    }

    public PedidoBodyDto(List<ProductoDetalleDto> productoDtos) {
        this.productos = productoDtos;
    }

    public PedidoBodyDto(Integer numeroMesa) {
        this.numeroMesa = numeroMesa;
    }
}