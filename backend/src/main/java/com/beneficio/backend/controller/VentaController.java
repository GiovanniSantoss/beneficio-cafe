package com.beneficio.backend.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beneficio.backend.model.Lote;
import com.beneficio.backend.model.Venta;
import com.beneficio.backend.repository.LoteRepository;
import com.beneficio.backend.repository.VentaRepository;
import com.beneficio.backend.service.InventarioService;

@RestController
@RequestMapping("/ventas")
@CrossOrigin("*")
public class VentaController {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private InventarioService inventarioService;

    @GetMapping
    public List<Venta> getAll() {
        return ventaRepository.findAll();
    }

    @PostMapping
    @Transactional
    public Venta create(@RequestBody Venta venta) {

        if (venta.getLote() == null || venta.getLote().getIdLote() == null) {
            throw new RuntimeException("El lote es obligatorio");
        }

        Lote lote = loteRepository.findById(venta.getLote().getIdLote())
                .orElseThrow(() -> new RuntimeException("Lote no encontrado"));

        // Solo el café en etapa ORO es vendible
        if (!"ORO".equalsIgnoreCase(lote.getEstadoCafe())) {
            throw new RuntimeException("Solo se puede vender café en etapa ORO");
        }

        if (!Boolean.TRUE.equals(lote.getActivo())) {
            throw new RuntimeException("El lote está inactivo");
        }

        if (venta.getCantidadVendida() == null
                || venta.getCantidadVendida().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Cantidad inválida");
        }

        // Valida stock y descuenta del inventario
        BigDecimal nuevoStock = inventarioService.descontarPorVenta(
                lote, venta.getCantidadVendida());

        lote.setPesoActual(nuevoStock);

        if (nuevoStock.compareTo(BigDecimal.ZERO) == 0) {
            lote.setActivo(false);
        }

        loteRepository.save(lote);

        venta.setLote(lote);

        return ventaRepository.save(venta);
    }
}
