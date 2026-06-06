package com.artesanos.sistema_pedidos.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.artesanos.sistema_pedidos.enums.EstadoPago;
import com.artesanos.sistema_pedidos.enums.EstadoPedido;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "pedido", indexes = {
        @jakarta.persistence.Index(name = "idx_pedido_estado", columnList = "estado"),
        @jakarta.persistence.Index(name = "idx_pedido_fecha", columnList = "fecha_pedido"),
        @jakarta.persistence.Index(name = "idx_pedido_mesa_estado", columnList = "n_mesa, estado"),
        @jakarta.persistence.Index(name = "idx_pedido_usuario", columnList = "fk_id_usuario"),
        @jakarta.persistence.Index(name = "idx_pedido_fecha_estado", columnList = "fecha_pedido, estado")
})
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pk_pedido")
    Integer id;
    @Column(name = "fecha_pedido")
    LocalDateTime fechaPedido;
    @Column(name = "total")
    Integer totalPedido;
    @Column(name = "n_mesa")
    Integer numeroMesa;
    @Enumerated(EnumType.STRING)
    @Column(name = "estado")
    EstadoPedido estadoPedido;
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago")
    EstadoPago estadoPago;
    @Column(name = "nombreDomicilio")
    String nombreDomicilio;
    @Column(name = "numero_cliente", columnDefinition = "VARCHAR(300)")
    String numeroCliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fk_id_usuario")
    Usuario usuario;
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    List<DetallePedido> detallesPedido;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    List<Pago> pagos = new ArrayList<>();

    public Pedido() {
        this.detallesPedido = new ArrayList<>();
    }

    public void addPago(Pago pago) {
        pagos.add(pago);
        pago.setPedido(this);
    }

    public void addDetalle(DetallePedido detalle) {
        detallesPedido.add(detalle);
        detalle.setPedido(this);

    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Pedido other = (Pedido) obj;
        return id != null && id.equals(other.id);
    }

}
