package com.beneficio.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record RecepcionResumenDTO(
        Long idRecepcion,
        LocalDateTime fechaHora,
        BigDecimal pesoInicial,
        String estado) {
}
