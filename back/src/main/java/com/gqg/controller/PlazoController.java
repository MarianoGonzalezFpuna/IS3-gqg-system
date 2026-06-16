package com.gqg.controller;

import com.gqg.model.Plazo;
import com.gqg.model.PlazoDetalle;
import com.gqg.repository.PlazoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/plazos")
@RequiredArgsConstructor
public class PlazoController {

    private final PlazoRepository repo;

    @GetMapping
    public List<Plazo> listar() {
        return repo.findAllByOrderByIdAsc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Plazo> obtener(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Plazo> crear(@RequestBody Plazo plazo) {
        // Asignar la referencia del plazo en cada detalle
        if (plazo.getPlazoDetalles() != null) {
            for (PlazoDetalle d : plazo.getPlazoDetalles()) {
                d.setPlazo(plazo);
            }
        }
        return ResponseEntity.ok(repo.save(plazo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Plazo> actualizar(@PathVariable Long id, @RequestBody Plazo datos) {
        return repo.findById(id).map(p -> {
            p.setPlazo(datos.getPlazo());
            p.setTipoId(datos.getTipoId());
            p.setCuotas(datos.getCuotas());
            p.setIrregular(datos.getIrregular());

            // Reemplazar detalles
            p.getPlazoDetalles().clear();
            if (datos.getPlazoDetalles() != null) {
                for (PlazoDetalle d : datos.getPlazoDetalles()) {
                    d.setPlazo(p);
                    p.getPlazoDetalles().add(d);
                }
            }

            return ResponseEntity.ok(repo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
