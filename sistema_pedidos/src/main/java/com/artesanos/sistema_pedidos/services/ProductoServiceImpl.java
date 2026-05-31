package com.artesanos.sistema_pedidos.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.artesanos.sistema_pedidos.dtos.ProductoDto;
import com.artesanos.sistema_pedidos.entities.Producto;
import com.artesanos.sistema_pedidos.repositories.ProductoRepository;

import jakarta.persistence.criteria.Predicate;

@Service
public class ProductoServiceImpl implements ProductoService {
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
        if (productoRepository.findByNombreProducto(producto.getNombreProducto().toLowerCase()).isPresent()) {
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

            productoRepository.findAll().forEach(pizza -> {
                if (pizza.getNombreProducto().startsWith("pizza") && pizza.isActivo()
                        && pizza.isCombinable()
                        && !pizza.getNombreProducto().contains(" + ")
                        && !pizza.getId().equals(productoGuardado.getId())) {

                    Producto pCombinado = new Producto();

                    String nombreCombinado = pizza.getNombreProducto().concat("+").concat(saborNuevo);

                    pCombinado.setNombreProducto(nombreCombinado);
                    pCombinado.setActivo(producto.isActivo());
                    pCombinado.setCombinable(false);
                    pCombinado.setPrecio(producto.getPrecioProducto());

                    pizzas.add(pCombinado);
                }
            });
            if (!pizzas.isEmpty()) {
                productoRepository.saveAll(pizzas);
            }
        }
        return Optional.of(productoGuardado);
    }

    @SuppressWarnings("null")
    @Transactional
    @Override
    public Optional<Producto> actualizarProducto(Integer id, ProductoDto producto) {
        if (productoRepository.findByNombreProducto(producto.getNombreProducto()).isPresent()) {
            return Optional.empty();
        }
        return productoRepository.findById(id).map(prodOptional -> {
            prodOptional.setActivo(producto.isActivo());
            prodOptional.setNombreProducto(producto.getNombreProducto().toLowerCase());
            prodOptional.setCombinable(producto.isCombinable());
            prodOptional.setPrecio(producto.getPrecioProducto());
            return productoRepository.save(prodOptional);
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
