package com.gqg.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "facturas")
@Data
@NoArgsConstructor
public class Factura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String numero;

    @Column(nullable = false, length = 10)
    private String tipo;  // venta, compra

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(name = "timbrado_id")
    private Long timbradoId;

    @Column(name = "deposito_id")
    private Long depositoId;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(name = "fecha_proceso")
    private OffsetDateTime fechaProceso;

    @Column(length = 20)
    private String moneda = "Guaraní";

    @Column(name = "total_neto", precision = 15, scale = 2)
    private BigDecimal totalNeto = BigDecimal.ZERO;

    @Column(name = "total_impuesto", precision = 15, scale = 2)
    private BigDecimal totalImpuesto = BigDecimal.ZERO;

    @Column(name = "total_excento", precision = 15, scale = 2)
    private BigDecimal totalExcento = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal total;

    @Column(nullable = false, length = 2)
    private String modalidad;  // CO, CR

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plazo_id")
    private Plazo plazo;

    @Column(length = 20)
    private String estado = "pendiente";

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL)
    @OrderBy("itemNro ASC")
    private List<FacturaDetalle> detalles;

    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL)
    @OrderBy("vence ASC")
    private List<Cuenta> cuentas;

    @PrePersist
    public void prePersist() {
        this.createdAt = OffsetDateTime.now();
        if (this.fechaProceso == null) {
            this.fechaProceso = OffsetDateTime.now();
        }
    }
}
