package com.artesanos.sistema_pedidos.enums;

public enum EstadoPedido {
    PENDIENTE, RESUELTO, CANCELADO;

    public static EstadoPedido fromString(String estado) {
        if (estado == null || estado.isBlank()) {
            throw new IllegalArgumentException("El estado del pedido no puede ser nulo o vacío");
        }
        for (EstadoPedido e : EstadoPedido.values()) {
            if (e.name().equalsIgnoreCase(estado.trim())) {
                return e;
            }
        }
        throw new IllegalArgumentException("Estado de pedido inválido: " + estado);
    }
}