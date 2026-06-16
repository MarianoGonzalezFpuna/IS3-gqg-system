package com.gqg.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "cuentas")
@Data
@NoArgsConstructor
public class Cuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "factura_id", nullable = false)
    @JsonIgnore
    private Factura factura;

    @Column(nullable = false, length = 10)
    private String tipo;  // cobrar, pagar

    @Column(nullable = false, length = 10)
    private String cuota; // "1/3", "2/3"

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal importe;

    @Column(nullable = false)
    private LocalDate vence;

    @Column(precision = 15, scale = 2)
    private BigDecimal cobrado = BigDecimal.ZERO;

    @Column(length = 20)
    private String estado = "pendiente";

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }
}
