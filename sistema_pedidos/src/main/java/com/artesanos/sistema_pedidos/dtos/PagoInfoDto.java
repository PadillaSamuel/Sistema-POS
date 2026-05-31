package com.artesanos.sistema_pedidos.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PagoInfoDto {
    String metodoPago;
    Integer monto;
}