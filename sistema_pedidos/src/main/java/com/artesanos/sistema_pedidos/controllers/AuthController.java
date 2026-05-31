package com.artesanos.sistema_pedidos.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.artesanos.sistema_pedidos.auth.AuthResponse;
import com.artesanos.sistema_pedidos.auth.AuthService;
import com.artesanos.sistema_pedidos.dtos.LoginRequestDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping(path = "/auth")
@Tag(name = "Autenticación", description = "Punto de acceso a la API")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "403", description = "Credenciales incoorrectas", content = @Content),
            @ApiResponse(responseCode = "200", description = "Credenciales correctas", content = @Content(mediaType = "application/json", schema = @Schema(implementation = AuthResponse.class)))
    })

    @Operation(summary = "Obtener los pedidos")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

}
