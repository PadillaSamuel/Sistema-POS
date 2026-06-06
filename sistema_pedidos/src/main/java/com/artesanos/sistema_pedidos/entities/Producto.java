package com.artesanos.sistema_pedidos.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "producto", indexes = {
        @Index(name = "idx_producto_nombre", columnList = "nombre"),
        @Index(name = "idx_producto_nombre_activo", columnList = "nombre, activo")
})
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_producto")
    Integer id;
    @Column(name = "nombre")
    String nombreProducto;
    Integer precio;
    @Column(name = "combinable")
    boolean combinable;

    @Column(name = "activo")
    boolean activo;

    public Producto() {
    }

}
