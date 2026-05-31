package com.artesanos.sistema_pedidos.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDto {
    @NotBlank(message = "El nombre de usuario es requerido")
    String nombreUsuario;

    @NotBlank(message = "La contraseña es requerida")
    String contrasena;
}