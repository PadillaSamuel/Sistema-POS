package com.artesanos.sistema_pedidos.services;

import java.util.List;
import java.util.Optional;

import com.artesanos.sistema_pedidos.dtos.ProductoDto;
import com.artesanos.sistema_pedidos.entities.Producto;

public interface ProductoService {
    public List<Producto> listarProductos();

    public List<Producto> listarProductosActivos();

    public List<Producto> buscarPorNombreIncompleto(String nombreProducto);

    public Optional<Producto> save(ProductoDto producto);

    public Optional<Producto> actualizarProducto(Integer id, ProductoDto producto);

    public Optional<Producto> desactivarProducto(Integer id);
}
