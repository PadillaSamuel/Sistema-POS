package com.artesanos.sistema_pedidos.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.artesanos.sistema_pedidos.dtos.ProductoDto;
import com.artesanos.sistema_pedidos.entities.Producto;
import com.artesanos.sistema_pedidos.repositories.ProductoRepository;

import jakarta.persistence.criteria.Predicate;

@Service
public class ProductoServiceImpl implements ProductoService {
    private static final Logger log = LoggerFactory.getLogger(ProductoServiceImpl.class);
    private static final String SEPARADOR_COMBINACION = " + ";

    private final ProductoRepository productoRepository;

    public ProductoServiceImpl(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Transactional(readOnly = true)
    @Override
    public List<Producto> listarProductos() {
        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    @Override
    public List<Producto> listarProductosActivos() {
        return productoRepository.findByActivoTrue();
    }

    @Transactional
    @Override
    public Optional<Producto> save(ProductoDto producto) {
        if (productoRepository.findByNombreProductoAndActivoTrue(producto.getNombreProducto().toLowerCase()).isPresent()) {
            return Optional.empty();
        }
        Producto nuevoProd = new Producto();
        nuevoProd.setActivo(producto.isActivo());
        nuevoProd.setNombreProducto(producto.getNombreProducto().toLowerCase());
        nuevoProd.setCombinable(producto.isCombinable());
        nuevoProd.setPrecio(producto.getPrecioProducto());

        Producto productoGuardado = productoRepository.save(nuevoProd);

        if (producto.isCombinable()) {
            List<Producto> pizzas = new ArrayList<>();
            String saborNuevo = nuevoProd.getNombreProducto().replace("pizza", "").trim();

            productoRepository.findPizzasCombinablesActivas().forEach(pizza -> {
                if (!pizza.getNombreProducto().contains(SEPARADOR_COMBINACION)
                        && !pizza.getId().equals(productoGuardado.getId())) {

                    Producto pCombinado = new Producto();

                    String nombreCombinado = pizza.getNombreProducto().trim()
                            .concat(SEPARADOR_COMBINACION)
                            .concat(saborNuevo);

                    pCombinado.setNombreProducto(nombreCombinado);
                    pCombinado.setActivo(producto.isActivo());
                    pCombinado.setCombinable(false);
                    pCombinado.setPrecio(producto.getPrecioProducto());

                    pizzas.add(pCombinado);
                }
            });
            if (!pizzas.isEmpty()) {
                productoRepository.saveAll(pizzas);
            } else {
                log.warn("Producto combinable creado (id={}, nombre='{}') sin combinaciones: no se encontraron pizzas activas+combinables previas",
                        productoGuardado.getId(), productoGuardado.getNombreProducto());
            }
        }
        return Optional.of(productoGuardado);
    }

    @Transactional
    @Override
    public Optional<Producto> actualizarProducto(Integer id, ProductoDto productoDto) {
        Optional<Producto> productoActual = productoRepository.findById(id);
        if (productoActual.isEmpty()) {
            return Optional.empty(); 
        }

        String nuevoNombre = productoDto.getNombreProducto().toLowerCase();
        if (productoRepository.existsByNombreProductoAndActivoTrueAndIdNot(nuevoNombre, id)) {
            throw new IllegalArgumentException("El nombre del producto ya está en uso por otro registro.");
        }
        Producto prod = productoActual.get();
        prod.setActivo(productoDto.isActivo());
        prod.setNombreProducto(nuevoNombre);
        prod.setCombinable(productoDto.isCombinable());
        prod.setPrecio(productoDto.getPrecioProducto());

        return Optional.of(productoRepository.save(prod));
    }

    @Transactional
    @Override
    public Optional<Producto> desactivarProducto(Integer id) {
        return productoRepository.findById(id).map(prod -> {
            prod.setActivo(false);
            return productoRepository.save(prod);
        });
    }

    @Transactional(readOnly = true)
    @Override
    public List<Producto> buscarPorNombreIncompleto(String nombreProducto) {
        String busquedaLimpia = nombreProducto.replace("+", " ").trim().toLowerCase();

        String[] palabras = busquedaLimpia.split("\\s+");

        Specification<Producto> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("activo")));

            for (String palabra : palabras) {
                predicates.add(cb.like(cb.lower(root.get("nombreProducto")), "%" + palabra + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return productoRepository.findAll(spec);
    }

}
