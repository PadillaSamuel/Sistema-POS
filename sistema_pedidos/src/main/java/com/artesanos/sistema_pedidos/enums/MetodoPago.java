package com.artesanos.sistema_pedidos.enums;

public enum MetodoPago {
    EFECTIVO, TRANSFERENCIA, DATAFONO;

    public static MetodoPago fromString(String metodo) {
        if (metodo == null || metodo.isBlank()) {
            throw new IllegalArgumentException("El método de pago no puede ser nulo o vacío");
        }
        try {
            return MetodoPago.valueOf(metodo.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Método de pago inválido: " + metodo + ". Valores válidos: EFECTIVO, TRANSFERENCIA, DATAFONO");
        }
    }
}