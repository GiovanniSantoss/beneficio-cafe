package com.beneficio.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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
        validarGeo(cafetal);
        return repository.save(cafetal);
    }


    @PutMapping("/{id}")
    public Cafetal update(@PathVariable Long id,
                          @RequestBody Cafetal data) {

        validarGeo(data);

        Cafetal c = repository.findById(id).orElseThrow();

        c.setNumParcela(data.getNumParcela());
        c.setUbicacion(data.getUbicacion());
        c.setAreaTotalHa(data.getAreaTotalHa());
        c.setLatitud(data.getLatitud());
        c.setLongitud(data.getLongitud());
        c.setPoligono(data.getPoligono());
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

    @PutMapping("/reactivar/{id}")
    public Cafetal reactivar(@PathVariable Long id) {
        Cafetal c = repository.findById(id).orElseThrow();
        c.setActivo(true);
        return repository.save(c);
    }


    // ---------- Validación de datos geográficos ----------

    private void validarGeo(Cafetal c) {
        Double lat = c.getLatitud();
        Double lng = c.getLongitud();

        if ((lat == null) != (lng == null)) {
            throw badRequest("Latitud y longitud deben enviarse juntas");
        }
        if (lat != null && (lat < -90 || lat > 90)) {
            throw badRequest("Latitud fuera de rango (-90 a 90)");
        }
        if (lng != null && (lng < -180 || lng > 180)) {
            throw badRequest("Longitud fuera de rango (-180 a 180)");
        }

        Map<String, Object> p = c.getPoligono();
        if (p != null) {
            Object coords = p.get("coordinates");
            if (!"Polygon".equals(p.get("type"))
                    || !(coords instanceof List<?> anillos)
                    || anillos.isEmpty()) {
                throw badRequest("El polígono debe ser un GeoJSON de tipo Polygon");
            }
        }
    }

    private ResponseStatusException badRequest(String mensaje) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, mensaje);
    }

}