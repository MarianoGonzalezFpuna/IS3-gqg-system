package com.gqg.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cod_barra", unique = true, length = 20)
    private String codBarra;

    @Column(nullable = false, length = 200)
    private String descripcion;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal precio = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer iva = 10;  // 0, 5, 10

    @Column(precision = 15, scale = 2)
    private BigDecimal costo = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal stock = BigDecimal.ZERO;

    @Column(length = 20)
    private String unidad = "Unid";

    @Column
    private Boolean activo = true;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }
}
