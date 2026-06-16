package com.gqg.service;

import com.gqg.dto.FacturaRequest;
import com.gqg.model.*;
import com.gqg.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FacturaService {

    private final FacturaRepository facturaRepo;
    private final ClienteRepository clienteRepo;
    private final PlazoRepository plazoRepo;

    public List<Factura> obtenerTodas() {
        return facturaRepo.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Factura crearFactura(FacturaRequest req) {
        // 1. Validar número único
        if (facturaRepo.existsByNumero(req.getNumero())) {
            throw new RuntimeException("Ya existe una factura con el número: " + req.getNumero());
        }

        // 2. Obtener cliente
        Cliente cliente = clienteRepo.findById(req.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado: " + req.getClienteId()));

        // 3. Obtener plazo (si aplica)
        Plazo plazo = null;
        if (req.getPlazoId() != null) {
            plazo = plazoRepo.findById(req.getPlazoId()).orElse(null);
        }

        // 4. Armar la factura
        Factura factura = new Factura();
        factura.setNumero(req.getNumero());
        factura.setTipo(req.getTipo());
        factura.setCliente(cliente);
        factura.setTimbradoId(req.getTimbradoId());
        factura.setDepositoId(req.getDepositoId());
        factura.setFecha(LocalDate.parse(req.getFecha()));
        factura.setMoneda(req.getMoneda());
        factura.setTotalNeto(req.getTotalNeto());
        factura.setTotalImpuesto(req.getTotalImpuesto());
        factura.setTotalExcento(req.getTotalExcento());
        factura.setTotal(req.getTotal());
        factura.setModalidad(req.getModalidad());
        factura.setPlazo(plazo);
        factura.setEstado("pendiente");

        // 5. Armar detalles
        List<FacturaDetalle> detalles = new ArrayList<>();
        for (int i = 0; i < req.getDetalles().size(); i++) {
            FacturaRequest.DetalleRequest d = req.getDetalles().get(i);
            FacturaDetalle det = new FacturaDetalle();
            det.setFactura(factura);
            det.setItemNro(i + 1);
            det.setProductoId(d.getProductoId());
            det.setCodBarra(d.getCodBarra());
            det.setDescripcion(d.getDescripcion());
            det.setPrecio(d.getPrecio());
            det.setIva(d.getIva());
            det.setBase(d.getBase());
            det.setImpuesto(d.getImpuesto());
            det.setDescuentoPct(d.getDescuentoPct() != null ? d.getDescuentoPct() : BigDecimal.ZERO);
            det.setDescuento(d.getDescuento() != null ? d.getDescuento() : BigDecimal.ZERO);
            det.setCantidad(d.getCantidad());
            det.setTotal(d.getTotal());
            detalles.add(det);
        }
        factura.setDetalles(detalles);

        // 6. Guardar factura + detalles
        // El trigger fn_generar_cuotas() en PostgreSQL genera las cuotas automáticamente
        return facturaRepo.save(factura);
    }
}