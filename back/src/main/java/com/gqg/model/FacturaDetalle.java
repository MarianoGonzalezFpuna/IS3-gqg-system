package com.gqg.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "factura_detalles")
@Data
@NoArgsConstructor
public class FacturaDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factura_id", nullable = false)
    @JsonIgnore
    private Factura factura;

    @Column(name = "item_nro", nullable = false)
    private Integer itemNro;

    @Column(name = "producto_id")
    private Long productoId;

    @Column(name = "cod_barra", length = 20)
    private String codBarra;

    @Column(nullable = false, length = 200)
    private String descripcion;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal precio;

    @Column(nullable = false)
    private Integer iva = 10;

    @Column(precision = 15, scale = 2)
    private BigDecimal base = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal impuesto = BigDecimal.ZERO;

    @Column(name = "descuento_pct", precision = 5, scale = 2)
    private BigDecimal descuentoPct = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal cantidad = BigDecimal.ONE;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }
}
