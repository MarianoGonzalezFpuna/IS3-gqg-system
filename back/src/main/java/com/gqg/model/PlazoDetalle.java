package com.gqg.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "plazo_detalles")
@Data
@NoArgsConstructor
public class PlazoDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plazo_id", nullable = false)
    @JsonIgnore
    private Plazo plazo;

    @Column(nullable = false)
    private Integer cuota;

    @Column(nullable = false)
    private Integer dias = 30;
}
