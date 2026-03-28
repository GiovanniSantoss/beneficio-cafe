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

import com.beneficio.backend.model.Recepcion;
import com.beneficio.backend.repository.RecepcionRepository;

@RestController
@RequestMapping("/recepciones")
@CrossOrigin(origins = "*")
public class RecepcionController {

    @Autowired
    private RecepcionRepository recepcionRepository;

    // ===== LISTAR =====
    @GetMapping
    public List<Recepcion> listar() {
        return recepcionRepository.findAll();
    }

    // ===== BUSCAR POR ID =====
    @GetMapping("/{id}")
    public Optional<Recepcion> buscarPorId(@PathVariable Long id) {
        return recepcionRepository.findById(id);
    }

    // ===== GUARDAR =====
    @PostMapping
    public Recepcion guardar(@RequestBody Recepcion recepcion) {
        return recepcionRepository.save(recepcion);
    }

    // ===== ELIMINAR =====
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        recepcionRepository.deleteById(id);
    }

}