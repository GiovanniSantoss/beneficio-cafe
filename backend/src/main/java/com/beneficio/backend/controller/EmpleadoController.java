package com.beneficio.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beneficio.backend.model.Empleado;
import com.beneficio.backend.repository.EmpleadoRepository;

@RestController
@RequestMapping("/empleados")
@CrossOrigin(origins = "*")
public class EmpleadoController {

    private final EmpleadoRepository repository;

    public EmpleadoController(EmpleadoRepository repository) {
        this.repository = repository;
    }

    // ===== LISTAR =====
    @GetMapping
    public List<Empleado> getAll() {
        return repository.findAll();
    }

    // ===== BUSCAR POR ID =====
    @GetMapping("/{id}")
    public Optional<Empleado> getById(@PathVariable Long id) {
        return repository.findById(id);
    }

    // ===== CREAR =====
    @PostMapping
    public Empleado create(@RequestBody Empleado empleado) {
        return repository.save(empleado);
    }

    // ===== ACTUALIZAR =====
    @PutMapping("/{id}")
    public Empleado update(@PathVariable Long id, @RequestBody Empleado data) {

        Empleado e = repository.findById(id).orElseThrow();

        e.setNombre(data.getNombre());
        e.setApellido(data.getApellido());
        e.setTelefono(data.getTelefono());
        e.setPuesto(data.getPuesto());
        e.setActivo(data.getActivo());

        return repository.save(e);
    }

    // ===== ELIMINAR (LÓGICO) =====
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {

        Empleado e = repository.findById(id).orElseThrow();
        e.setActivo(false);

        repository.save(e);
    }

    // ===== REACTIVAR =====
    @PutMapping("/reactivar/{id}")
    public Empleado reactivar(@PathVariable Long id) {

        Empleado e = repository.findById(id).orElseThrow();
        e.setActivo(true);

        return repository.save(e);
    }
}