package com.gqg.controller;

import com.gqg.model.Producto;
import com.gqg.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoRepository repo;

    @GetMapping
    public List<Producto> listar(@RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) {
            return repo.findByActivoTrueAndDescripcionContainingIgnoreCaseOrActivoTrueAndCodBarraContainingIgnoreCase(q, q);
        }
        return repo.findByActivoTrueOrderByDescripcionAsc();
    }

    @GetMapping("/codigo/{codBarra}")
    public ResponseEntity<Producto> buscarPorCodigo(@PathVariable String codBarra) {
        return repo.findByCodBarraAndActivoTrue(codBarra)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Producto> crear(@RequestBody Producto producto) {
        producto.setActivo(true);
        return ResponseEntity.ok(repo.save(producto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @RequestBody Producto datos) {
        return repo.findById(id).map(p -> {
            p.setCodBarra(datos.getCodBarra());
            p.setDescripcion(datos.getDescripcion());
            p.setPrecio(datos.getPrecio());
            p.setIva(datos.getIva());
            p.setCosto(datos.getCosto());
            p.setStock(datos.getStock());
            p.setUnidad(datos.getUnidad());
            return ResponseEntity.ok(repo.save(p));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return repo.findById(id).map(p -> {
            p.setActivo(false);
            repo.save(p);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
