package com.beneficio.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beneficio.backend.model.Productor;
import com.beneficio.backend.repository.ProductorRepository;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/productores")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductorController {

    private final ProductorRepository repository;

    public ProductorController(ProductorRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Productor> listar() {
        return repository.findAll();
    }

    @PostMapping
public ResponseEntity<Productor> crear(@Valid @RequestBody Productor productor) {
        Productor nuevo = repository.save(productor);
    return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
}

    @GetMapping("/{id}")
    public ResponseEntity<Productor> obtenerPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Productor> actualizar(
            @PathVariable Long id,
            @RequestBody Productor productorActualizado) {

        Optional<Productor> optional = repository.findById(id);

        if (optional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Productor productor = optional.get();

        productor.setNombre(productorActualizado.getNombre());
        productor.setApellido(productorActualizado.getApellido());
        productor.setTelefono(productorActualizado.getTelefono());
        productor.setGenero(productorActualizado.getGenero());
        productor.setComunidad(productorActualizado.getComunidad());
        productor.setLocalidad(productorActualizado.getLocalidad());
        productor.setEstado(productorActualizado.getEstado());

        return ResponseEntity.ok(repository.save(productor));
    }

    // 🔴 DELETE (SOFT DELETE)
    @DeleteMapping("/{id}")
public ResponseEntity<Void> eliminar(@PathVariable Long id) {

    Optional<Productor> optional = repository.findById(id);

    if (optional.isEmpty()) {
        return ResponseEntity.notFound().build();
    }

    Productor productor = optional.get();
    productor.setActivo(false);
    repository.save(productor);

    return ResponseEntity.noContent().build();
}
}