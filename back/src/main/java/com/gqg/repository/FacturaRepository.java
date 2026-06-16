package com.gqg.repository;

import com.gqg.model.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {
    List<Factura> findAllByOrderByCreatedAtDesc();
    boolean existsByNumero(String numero);

    @Query("SELECT MAX(f.numero) FROM Factura f WHERE f.numero LIKE '001-001-%'")
    Optional<String> findUltimoNumero();
}