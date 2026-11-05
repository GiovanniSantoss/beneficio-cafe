package com.beneficio.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InventarioItemDTO(
        Long idInventario,
        Long idLote,
        String estadoCafe,
        BigDecimal stockActual,
        String ubicacion,
        LocalDateTime fechaActualizacion,
        Boolean activo,
        String estadoStock,
        boolean vendible,
        ProductorResumenDTO productor,
        CafetalResumenDTO cafetal,
        RecepcionResumenDTO recepcion) {
}
