package com.beneficio.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VentaHistorialDTO(
        Long idVenta,
        LocalDateTime fechaVenta,
        String comprador,
        BigDecimal cantidadVendida,
        BigDecimal precioVenta) {
}
