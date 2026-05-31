package com.artesanos.sistema_pedidos.dtos;

import java.util.List;

import com.artesanos.sistema_pedidos.enums.EstadoPago;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PedidoPagoDto {
    Integer id;
    Integer numeroMesa;
    Integer total;
    String nombreDomicilio;
    EstadoPago estadoPago;
    String numeroCliente;
    List<PagoInfoDto> pagos;

    public PedidoPagoDto(Integer id, Integer total, Integer numeroMesa, String nombreDomicilio,
            EstadoPago estadoPago, String numeroCliente) {
        this.id = id;
        this.total = total;
        this.numeroMesa = numeroMesa;
        this.nombreDomicilio = nombreDomicilio;
        this.estadoPago = estadoPago;
        this.numeroCliente = numeroCliente;
    }
}