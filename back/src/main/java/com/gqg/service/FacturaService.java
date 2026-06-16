package com.gqg.service;

import com.gqg.dto.FacturaRequest;
import com.gqg.model.*;
import com.gqg.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
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
            plazo = plazoRepo.findById(req.getPlazoId())
                    .orElse(null);
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

        // 6. Guardar factura (JPA guarda detalles en cascada)
        Factura guardada = facturaRepo.save(factura);

        // 7. Generar cuotas en Java (replica la lógica del trigger SQL)
        List<Cuenta> cuotas = generarCuotas(guardada, plazo);
        guardada.setCuentas(cuotas);
        return facturaRepo.save(guardada);
    }

    /**
     * Genera las cuotas de la factura según la modalidad y el plazo.
     * Replica la lógica del trigger fn_generar_cuotas() de PostgreSQL.
     */
    private List<Cuenta> generarCuotas(Factura factura, Plazo plazo) {
        List<Cuenta> cuotas = new ArrayList<>();
        String tipoCuenta = "venta".equals(factura.getTipo()) ? "cobrar" : "pagar";
        BigDecimal total = factura.getTotal();
        LocalDate fechaFactura = factura.getFecha();

        if ("CO".equals(factura.getModalidad())) {
            // Contado: una sola cuota que vence hoy
            Cuenta c = new Cuenta();
            c.setFactura(factura);
            c.setTipo(tipoCuenta);
            c.setCuota("1/1");
            c.setImporte(total);
            c.setVence(fechaFactura);
            c.setCobrado(BigDecimal.ZERO);
            c.setEstado("pendiente");
            cuotas.add(c);
            return cuotas;
        }

        // Crédito: distribuir en N cuotas
        int cantCuotas = plazo.getCuotas();
        BigDecimal importePorCuota = total.divide(
                BigDecimal.valueOf(cantCuotas), 0, RoundingMode.FLOOR);
        BigDecimal resto = total.subtract(importePorCuota.multiply(BigDecimal.valueOf(cantCuotas)));

        List<PlazoDetalle> detallesPlazo = plazo.getPlazoDetalles();

        for (int i = 1; i <= cantCuotas; i++) {
            LocalDate vence;

            if (Boolean.TRUE.equals(plazo.getIrregular()) && detallesPlazo != null) {
                // Irregular: sumar días específicos
                int dias = detallesPlazo.stream()
                        .filter(d -> d.getCuota() == i)
                        .findFirst()
                        .map(PlazoDetalle::getDias)
                        .orElse(i * 30);
                vence = fechaFactura.plusDays(dias);
            } else {
                // Regular: cada 30 días
                vence = fechaFactura.plusDays((long) i * 30);
            }

            BigDecimal importe = (i == cantCuotas)
                    ? importePorCuota.add(resto)
                    : importePorCuota;

            Cuenta c = new Cuenta();
            c.setFactura(factura);
            c.setTipo(tipoCuenta);
            c.setCuota(i + "/" + cantCuotas);
            c.setImporte(importe);
            c.setVence(vence);
            c.setCobrado(BigDecimal.ZERO);
            c.setEstado("pendiente");
            cuotas.add(c);
        }

        return cuotas;
    }
}
