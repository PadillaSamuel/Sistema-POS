package com.artesanos.sistema_pedidos.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "producto_pedido", indexes = {
        @Index(name = "idx_detalle_pedido", columnList = "fk_n_pedido"),
        @Index(name = "idx_detalle_producto", columnList = "fk_id_producto")
})
public class DetallePedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_productoxpedido")
    Integer id;
    @Column(name = "precio_momento")
    Integer precioMomento;
    @Column(name = "subtotal_pedido")
    Integer subtotalPedido;
    @Column(name = "cantidad")
    Integer cantidadProducto;
    @Column(name = "peticionCliente", columnDefinition = "VARCHAR(300)")
    String peticionCliente;
    @Column(name = "fecha_modificacion")
    LocalDateTime fechaModificacion;
    @Column(name = "modificado", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    boolean modificado;
    @ManyToOne
    @JoinColumn(name = "fk_n_pedido")
    Pedido pedido;
    @ManyToOne
    @JoinColumn(name = "fk_id_producto")
    Producto producto;

    public DetallePedido() {
    }
}
