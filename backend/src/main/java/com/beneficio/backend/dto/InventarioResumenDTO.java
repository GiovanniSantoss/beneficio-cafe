package com.beneficio.backend.dto;

import java.math.BigDecimal;
import java.util.Map;

public record InventarioResumenDTO(
        BigDecimal kgTotales,
        Map<String, BigDecimal> kgPorEtapa,
        long lotesTotales,
        long lotesConStock,
        long lotesOroVendibles,
        long lotesCancelados,
        long lotesAgotados,
        long lotesSinInventario,
        long lotesSinUbicacion) {
}
