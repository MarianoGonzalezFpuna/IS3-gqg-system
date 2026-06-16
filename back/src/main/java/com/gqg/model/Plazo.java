package com.gqg.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.List;

@Entity
@Table(name = "plazos")
@Data
@NoArgsConstructor
public class Plazo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String plazo;

    @Column(name = "tipo_id", nullable = false)
    private Integer tipoId = 1;  // 0=Contado, 1=Crédito

    @Column(nullable = false)
    private Integer cuotas = 1;

    @Column(nullable = false)
    private Boolean irregular = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "plazo", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("cuota ASC")
    private List<PlazoDetalle> plazoDetalles;

    @PrePersist
    public void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }
}
