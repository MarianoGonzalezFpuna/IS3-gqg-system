package com.gqg.repository;

import com.gqg.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    List<Cliente> findByActivoTrueOrderByNombreAsc();
    List<Cliente> findByActivoTrueAndNombreContainingIgnoreCaseOrActivoTrueAndRucCiContainingIgnoreCase(String nombre, String rucCi);
}
