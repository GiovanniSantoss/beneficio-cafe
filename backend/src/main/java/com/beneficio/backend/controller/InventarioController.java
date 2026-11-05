package com.beneficio.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.beneficio.backend.dto.InventarioDetalleDTO;
import com.beneficio.backend.dto.InventarioItemDTO;
import com.beneficio.backend.dto.InventarioResumenDTO;
import com.beneficio.backend.service.InventarioService;

@RestController
@RequestMapping("/inventario")
@CrossOrigin(origins = "*")
public class InventarioController {

    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @GetMapping("/resumen")
    public InventarioResumenDTO resumen() {
        return inventarioService.resumen();
    }

    @GetMapping
    public List<InventarioItemDTO> listar(
            @RequestParam(required = false) String etapa,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Boolean soloVendibles) {

        return inventarioService.listar(etapa, estado, q, soloVendibles);
    }

    @GetMapping("/lote/{idLote}")
    public InventarioDetalleDTO detalle(@PathVariable Long idLote) {
        return inventarioService.detalle(idLote);
    }
}
