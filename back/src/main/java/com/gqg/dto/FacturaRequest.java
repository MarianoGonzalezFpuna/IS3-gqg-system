package com.gqg.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class FacturaRequest {

    private String numero;
    private String tipo;                 // venta, compra
    private Long clienteId;
    private Long timbradoId;
    private Long depositoId;
    private String fecha;                // yyyy-MM-dd
    private String fechaProceso;
    private String moneda;
    private BigDecimal totalNeto;
    private BigDecimal totalImpuesto;
    private BigDecimal totalExcento;
    private BigDecimal total;
    private String modalidad;            // CO, CR
    private Long plazoId;
    private List<DetalleRequest> detalles;

    @Data
    public static class DetalleRequest {
        private Long productoId;
        private String codBarra;
        private String descripcion;
        private BigDecimal precio;
        private Integer iva;
        private BigDecimal base;
        private BigDecimal impuesto;
        private BigDecimal descuentoPct;
        private BigDecimal descuento;
        private BigDecimal cantidad;
        private BigDecimal total;
    }
}
