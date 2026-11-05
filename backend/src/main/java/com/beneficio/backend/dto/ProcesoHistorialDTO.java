package com.beneficio.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProcesoHistorialDTO(
        Long idProceso,
        String tipoProceso,
        BigDecimal pesoResultante,
        LocalDateTime fecha,
        String empleado,
        String observaciones) {
}
