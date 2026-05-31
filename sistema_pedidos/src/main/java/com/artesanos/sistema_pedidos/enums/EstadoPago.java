package com.artesanos.sistema_pedidos.enums;

public enum EstadoPago {
    PENDIENTE, PAGADO, ANULADO;

    public static EstadoPago fromString(String estado) {
        if (estado == null || estado.isBlank()) {
            throw new IllegalArgumentException("El estado de pago no puede ser nulo o vacío");
        }
        for (EstadoPago e : EstadoPago.values()) {
            if (e.name().equalsIgnoreCase(estado.trim())) {
                return e;
            }
        }
        throw new IllegalArgumentException("Estado de pago inválido: " + estado);
    }
}