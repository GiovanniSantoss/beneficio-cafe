package com.beneficio.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.beneficio.backend.model.Cafetal;
import com.beneficio.backend.repository.CafetalRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/cafetales")
public class CafetalController {

    private final CafetalRepository repository;

    public CafetalController(CafetalRepository repository) {
        this.repository = repository;
    }


    @GetMapping
    public List<Cafetal> getAll() {
        return repository.findAll();
    }


    @PostMapping
    public Cafetal create(@RequestBody Cafetal cafetal) {
        return repository.save(cafetal);
    }


    @PutMapping("/{id}")
public Cafetal update(@PathVariable Long id,
                      @RequestBody Cafetal data) {

    Cafetal c = repository.findById(id).orElseThrow();

    c.setNumParcela(data.getNumParcela());
    c.setUbicacion(data.getUbicacion());
    c.setAreaTotalHa(data.getAreaTotalHa());
    c.setLatitud(data.getLatitud());
    c.setLongitud(data.getLongitud());
    c.setActivo(data.getActivo());

    if (data.getProductor() != null) {
        c.setProductor(data.getProductor());
    }

    return repository.saveAndFlush(c);
}


    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {

        Cafetal c = repository.findById(id).orElseThrow();

        c.setActivo(false);

        repository.save(c);
    }

}