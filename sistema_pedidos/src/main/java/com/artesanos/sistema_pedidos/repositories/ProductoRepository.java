package com.artesanos.sistema_pedidos.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.artesanos.sistema_pedidos.entities.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer>, JpaSpecificationExecutor<Producto> {

    public Optional<Producto> findByNombreProducto(String nombreProducto);

    public Optional<Producto> findByNombreProductoAndActivoTrue(String nombreProducto);

    public List<Producto> findByActivoTrue();
    boolean existsByNombreProductoAndIdNot(String nombreProducto, Integer id);
    boolean existsByNombreProductoAndActivoTrueAndIdNot(String nombreProducto, Integer id);
    // public List<Producto> findByNombreProductoContainingIgnoreCaseAndActivoTrue(String nombreProducto);
}
