package com.beneficio.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beneficio.backend.model.Lote;
import com.beneficio.backend.model.Procesos;
import com.beneficio.backend.repository.LoteRepository;
import com.beneficio.backend.repository.ProcesosRepository;
@RestController
@RequestMapping("/procesos")
@CrossOrigin("*")
public class ProcesosController {

    @Autowired
    private ProcesosRepository procesosRepository;

    @Autowired
    private LoteRepository loteRepository;

    @GetMapping
    public List<Procesos> getAll() {
        return procesosRepository.findAll();
    }

    @GetMapping("/lote/{idLote}")
    public List<Procesos> getByLote(@PathVariable Long idLote) {
        return procesosRepository.findByLote_IdLote(idLote);
    }

    @PostMapping
public Procesos create(@RequestBody Procesos proceso) {

    // VALIDAR LOTE
    if (proceso.getLote() == null || proceso.getLote().getIdLote() == null) {
        throw new RuntimeException("El lote es obligatorio");
    }

    // Obtener lote real
    Lote lote = loteRepository.findById(proceso.getLote().getIdLote())
            .orElseThrow(() -> new RuntimeException("Lote no encontrado"));

    // VALIDAR PESO NULL
    if (proceso.getPesoResultante() == null) {
        throw new RuntimeException("El peso resultante es obligatorio");
    }

    // VALIDAR PESO > 0
    if (proceso.getPesoResultante().compareTo(java.math.BigDecimal.ZERO) <= 0) {
        throw new RuntimeException("El peso debe ser mayor a 0");
    }

    // VALIDAR QUE NO AUMENTE
    if (proceso.getPesoResultante().compareTo(lote.getPesoActual()) > 0) {
        throw new RuntimeException("El peso no puede ser mayor al actual del lote");
    }

    // VALIDAR LOTE ACTIVO
    if (!lote.getActivo()) {
        throw new RuntimeException("El lote está inactivo");
    }

    // Asignar lote validado
    proceso.setLote(lote);

    // Guardar proceso
    Procesos nuevo = procesosRepository.save(proceso);

    // Actualizar peso del lote
    lote.setPesoActual(proceso.getPesoResultante());
    loteRepository.save(lote);

    return nuevo;
}

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        procesosRepository.deleteById(id);
    }
}