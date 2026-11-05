package com.beneficio.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InventarioDetalleDTO(
        InventarioItemDTO inventario,
        String estadoLote,
        LocalDateTime fechaCreacionLote,
        BigDecimal pesoActualLote,
        List<ProcesoHistorialDTO> procesos,
        List<VentaHistorialDTO> ventas,
        List<String> alertas) {
}
