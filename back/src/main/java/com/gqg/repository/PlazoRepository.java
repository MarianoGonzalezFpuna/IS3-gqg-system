package com.gqg.repository;

import com.gqg.model.Plazo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlazoRepository extends JpaRepository<Plazo, Long> {
    List<Plazo> findAllByOrderByIdAsc();
}
