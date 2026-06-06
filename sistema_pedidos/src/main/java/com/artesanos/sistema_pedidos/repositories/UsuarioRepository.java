package com.artesanos.sistema_pedidos.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.artesanos.sistema_pedidos.entities.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    public Optional<Usuario> findByNombre(String nombre);

    @Query("select u from Usuario u join fetch u.rol where u.nombre = :nombre")
    public Optional<Usuario> findByNombreWithRol(@Param("nombre") String nombre);
}
