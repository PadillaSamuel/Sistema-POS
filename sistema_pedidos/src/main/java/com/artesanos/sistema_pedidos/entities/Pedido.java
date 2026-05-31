package com.artesanos.sistema_pedidos.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.artesanos.sistema_pedidos.enums.MetodoPago;
import com.artesanos.sistema_pedidos.enums.EstadoPago;
import com.artesanos.sistema_pedidos.enums.EstadoPedido;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
        @jakarta.persistence.Index(name = "idx_pedido_mesa_estado", columnList = "n_mesa, estado")
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

    @ManyToOne
    @JoinColumn(name = "fk_id_usuario")
    Usuario usuario;
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    List<DetallePedido> detallesPedido;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
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
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((fechaPedido == null) ? 0 : fechaPedido.hashCode());
        result = prime * result + ((totalPedido == null) ? 0 : totalPedido.hashCode());
        result = prime * result + ((numeroMesa == null) ? 0 : numeroMesa.hashCode());
        return result;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        Pedido other = (Pedido) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        if (fechaPedido == null) {
            if (other.fechaPedido != null)
                return false;
        } else if (!fechaPedido.equals(other.fechaPedido))
            return false;
        if (totalPedido == null) {
            if (other.totalPedido != null)
                return false;
        } else if (!totalPedido.equals(other.totalPedido))
            return false;
        if (numeroMesa == null) {
            if (other.numeroMesa != null)
                return false;
        } else if (!numeroMesa.equals(other.numeroMesa))
            return false;
        return true;
    }

}
