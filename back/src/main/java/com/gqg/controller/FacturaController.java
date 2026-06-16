package com.gqg.controller;

import com.gqg.dto.FacturaRequest;
import com.gqg.model.Factura;
import com.gqg.service.FacturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaService service;

    @GetMapping
    public List<Factura> listar() {
        return service.obtenerTodas();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody FacturaRequest req) {
        try {
            Factura factura = service.crearFactura(req);
            return ResponseEntity.ok(factura);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
