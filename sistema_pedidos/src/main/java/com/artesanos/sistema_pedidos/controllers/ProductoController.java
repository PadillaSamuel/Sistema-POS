package com.artesanos.sistema_pedidos.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.artesanos.sistema_pedidos.dtos.ProductoDto;
import com.artesanos.sistema_pedidos.entities.Producto;
import com.artesanos.sistema_pedidos.services.ProductoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping(path = "/api/producto")
@Tag(name = "Productos", description = "Gestión de los Productos")
public class ProductoController {
    private final ProductoService productoService;

    ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "No hay productos por mostrar", content = @Content),
            @ApiResponse(responseCode = "200", description = "Productos listados", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Producto.class))))
    })
    @Operation(summary = "Listar productos")
    @GetMapping("/listar")
    @PreAuthorize("hasAuthority('ROLE_CAJA')")
    public ResponseEntity<List<Producto>> getProductos() {

        List<Producto> productos = productoService.listarProductos();
        if (productos.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().body(productos);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "No hay productos por mostrar", content = @Content),
            @ApiResponse(responseCode = "200", description = "Productos activos listados", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Producto.class))))
    })
    @Operation(summary = "Listar productos activos")
    @GetMapping("/listar/activos")
    @PreAuthorize("hasAnyAuthority('ROLE_CAJA', 'ROLE_MESERA')")
    public ResponseEntity<List<Producto>> getProductosActivos() {
        List<Producto> productos = productoService.listarProductosActivos();
        if (productos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(productos);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "No hay productos con ese nombre", content = @Content),
            @ApiResponse(responseCode = "200", description = "Productos con nombre específico listados", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = Producto.class))))
    })
    @Operation(summary = "Listar productos por nombre")
    @GetMapping("/listar/{nombre}")
    @PreAuthorize("hasAnyAuthority('ROLE_CAJA', 'ROLE_MESERA')")
    public ResponseEntity<List<Producto>> getProductosNombre(@PathVariable String nombre) {

        List<Producto> productos = productoService.buscarPorNombreIncompleto(nombre);
        if (productos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().body(productos);
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "400", description = "Parametros incoherentes para crear un producto", content = @Content),
            @ApiResponse(responseCode = "200", description = "Producto creado")
    })
    @Operation(summary = "Crear producto")
    @PostMapping("/crear")
    @PreAuthorize("hasAuthority('ROLE_CAJA')")
    public ResponseEntity<?> postProducto(@Valid @RequestBody ProductoDto productoDto) {
        if (productoService.save(productoDto).isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("El producto ya existe, actualizalo desde la sección de búsqueda");
        }
        return ResponseEntity.ok().build();
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "404", description = "Intentar actualizar producto con id no existente", content = @Content),
            @ApiResponse(responseCode = "200", description = "Producto actualizado")
    })
    @Operation(summary = "Actualizar producto por id")
    @PutMapping("/actualizar/{id}")
    @PreAuthorize("hasAuthority('ROLE_CAJA')")

    public ResponseEntity<?> postProducto(@PathVariable Integer id, @Valid @RequestBody ProductoDto productoDto) {
        if (productoService.actualizarProducto(id, productoDto).isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No es posible actualizar a un producto ya existente");
        }
        return ResponseEntity.ok().build();
    }
}
