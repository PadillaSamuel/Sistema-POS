package com.artesanos.sistema_pedidos.entities;

import com.artesanos.sistema_pedidos.enums.EstadoPago;
import com.artesanos.sistema_pedidos.enums.MetodoPago;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "pago")
public class Pago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_pago")
    Integer id;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false)
    MetodoPago metodoPago;

    @Column(name = "monto", nullable = false)
    Integer monto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_id_pedido", nullable = false)
    Pedido pedido;
}

// [
//   {
//     "metodoPago": "EFECTIVO",
//     "monto": 25000
//   },
//   {
//     "metodoPago": "DATAFONO",
//     "monto": 35000
//   }
// ]