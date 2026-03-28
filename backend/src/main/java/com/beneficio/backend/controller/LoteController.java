package com.beneficio.backend.controller;

import java.util.List;
import java.util.Optional;

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
import com.beneficio.backend.repository.LoteRepository;

@RestController
@RequestMapping("/lotes")
@CrossOrigin(origins = "*")
public class LoteController {

    @Autowired
    private LoteRepository loteRepository;

    // ===== LISTAR =====
    @GetMapping
    public List<Lote> listar() {
        return loteRepository.findAll();
    }

    // ===== BUSCAR =====
    @GetMapping("/{id}")
    public Optional<Lote> buscar(@PathVariable Long id) {
        return loteRepository.findById(id);
    }

    // ===== GUARDAR =====
    @PostMapping
    public Lote guardar(@RequestBody Lote lote) {
        return loteRepository.save(lote);
    }

    // ===== ELIMINAR =====
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        loteRepository.deleteById(id);
    }

}
