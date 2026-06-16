package com.gqg.controller;

import com.gqg.model.Cliente;
import com.gqg.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteRepository repo;

    @GetMapping
    public List<Cliente> listar(@RequestParam(required = false) String q) {
        if (q != null && !q.isBlank()) {
            return repo.findByActivoTrueAndNombreContainingIgnoreCaseOrActivoTrueAndRucCiContainingIgnoreCase(q, q);
        }
        return repo.findByActivoTrueOrderByNombreAsc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cliente> obtener(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cliente> crear(@RequestBody Cliente cliente) {
        cliente.setActivo(true);
        return ResponseEntity.ok(repo.save(cliente));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizar(@PathVariable Long id, @RequestBody Cliente datos) {
        return repo.findById(id).map(c -> {
            c.setNombre(datos.getNombre());
            c.setRucCi(datos.getRucCi());
            c.setDireccion(datos.getDireccion());
            c.setTelefono(datos.getTelefono());
            c.setEmail(datos.getEmail());
            c.setTipo(datos.getTipo());
            return ResponseEntity.ok(repo.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        return repo.findById(id).map(c -> {
            c.setActivo(false);
            repo.save(c);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
