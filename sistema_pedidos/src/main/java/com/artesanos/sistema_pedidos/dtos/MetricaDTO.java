package com.artesanos.sistema_pedidos.dtos;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MetricaDTO {
    Map<Integer, Integer> pedidosMeses;
    Map<Integer,Map<Integer, Integer>> pagosMeses;
}
