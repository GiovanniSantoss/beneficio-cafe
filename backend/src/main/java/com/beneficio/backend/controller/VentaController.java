package com.beneficio.backend.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

@RestController
@RequestMapping("/ventas")
@CrossOrigin("*")
public class VentaController {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private LoteRepository loteRepository;

    @GetMapping
    public List<Venta> getAll() {
        return ventaRepository.findAll();
    }

    @PostMapping
    public Venta create(@RequestBody Venta venta) {

        Lote lote = loteRepository.findById(venta.getLote().getIdLote())
                .orElseThrow(() -> new RuntimeException("Lote no encontrado"));

        if (venta.getCantidadVendida().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Cantidad inválida");
        }

        if (venta.getCantidadVendida().compareTo(lote.getPesoActual()) > 0) {
            throw new RuntimeException("No hay suficiente café en el lote");
        }

        BigDecimal nuevoPeso = lote.getPesoActual().subtract(venta.getCantidadVendida());
        lote.setPesoActual(nuevoPeso);

        if (nuevoPeso.compareTo(BigDecimal.ZERO) == 0) {
            lote.setActivo(false);
        }

        loteRepository.save(lote);

        return ventaRepository.save(venta);
    }
}