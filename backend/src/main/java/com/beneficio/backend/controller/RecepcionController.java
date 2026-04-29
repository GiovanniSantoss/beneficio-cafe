package com.beneficio.backend.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
import com.beneficio.backend.model.Empleado;
import com.beneficio.backend.model.Lote;
import com.beneficio.backend.model.Productor;
import com.beneficio.backend.model.Recepcion;
import com.beneficio.backend.model.Usuario;
import com.beneficio.backend.repository.CafetalRepository;
import com.beneficio.backend.repository.EmpleadoRepository;
import com.beneficio.backend.repository.LoteRepository;
import com.beneficio.backend.repository.ProductorRepository;
import com.beneficio.backend.repository.RecepcionRepository;
import com.beneficio.backend.repository.UsuarioRepository;

@RestController
@RequestMapping("/recepciones")
@CrossOrigin(origins = "*")
public class RecepcionController {

    @Autowired
    private RecepcionRepository recepcionRepository;
    @Autowired
    private LoteRepository loteRepository;
    @Autowired
    private CafetalRepository cafetalRepository;
    @Autowired
    private ProductorRepository productorRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private EmpleadoRepository empleadoRepository;

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

        // ===== VALIDACIONES BÁSICAS =====
        if (recepcion.getProductor() == null || recepcion.getProductor().getIdProductor() == null) {
            throw new RuntimeException("El productor es obligatorio");
        }

        if (recepcion.getCafetal() == null || recepcion.getCafetal().getIdCafetal() == null) {
            throw new RuntimeException("El cafetal es obligatorio");
        }

        if (recepcion.getUsuario() == null || recepcion.getUsuario().getIdUsuario() == null) {
            throw new RuntimeException("El usuario es obligatorio");
        }

        if (recepcion.getPesoInicial() == null) {
            throw new RuntimeException("El peso inicial es obligatorio");
        }

        if (recepcion.getPesoFinal() != null
                && recepcion.getPesoFinal().compareTo(recepcion.getPesoInicial()) > 0) {
            throw new RuntimeException("El peso final no puede ser mayor al inicial");
        }

        // ===== TRAER DATOS REALES DE BD =====
        Productor productorBD = productorRepository.findById(
                recepcion.getProductor().getIdProductor()
        ).orElseThrow(() -> new RuntimeException("Productor no encontrado"));

        Cafetal cafetalBD = cafetalRepository.findById(
                recepcion.getCafetal().getIdCafetal()
        ).orElseThrow(() -> new RuntimeException("Cafetal no encontrado"));

        Usuario usuarioBD = usuarioRepository.findById(
                recepcion.getUsuario().getIdUsuario()
        ).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Empleado empleadoBD = null;
        if (recepcion.getEmpleado() != null
                && recepcion.getEmpleado().getIdEmpleado() != null) {

            empleadoBD = empleadoRepository.findById(
                    recepcion.getEmpleado().getIdEmpleado()
            ).orElse(null);
        }

        // ===== VALIDAR RELACIÓN CORRECTA =====
        if (!cafetalBD.getProductor().getIdProductor()
                .equals(productorBD.getIdProductor())) {
            System.out.println("ERROR: cafetal no pertenece al productor");
            return null;
        }

        // ===== CREAR NUEVA RECEPCIÓN LIMPIA =====
        Recepcion nueva = new Recepcion();
        nueva.setProductor(productorBD);
        nueva.setCafetal(cafetalBD);
        nueva.setUsuario(usuarioBD);
        nueva.setEmpleado(empleadoBD);
        nueva.setPesoInicial(recepcion.getPesoInicial());
        nueva.setPesoFinal(recepcion.getPesoFinal());
        nueva.setObservaciones(recepcion.getObservaciones());
        nueva.setFechaHora(java.time.LocalDateTime.now());
        nueva.setActivo(true);

        // ===== GUARDAR =====
        Recepcion guardada = recepcionRepository.save(nueva);

        // ===== CREAR LOTE =====
        Lote lote = new Lote();
        lote.setRecepcion(guardada);
        lote.setEstadoCafe("CEREZA");
        lote.setPesoActual(guardada.getPesoFinal());
        lote.setActivo(true);

        loteRepository.save(lote);

        return guardada;
    }

    // ===== ELIMINAR =====
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        recepcionRepository.deleteById(id);
    }

    @PutMapping("/{id}")
    public Recepcion actualizar(@PathVariable Long id, @RequestBody Recepcion datos) {

        Recepcion recepcion = recepcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recepción no encontrada"));

        if (datos.getPesoFinal() != null) {
            recepcion.setPesoFinal(datos.getPesoFinal());
        }

        if (datos.getObservaciones() != null) {
            recepcion.setObservaciones(datos.getObservaciones());
        }

        return recepcionRepository.save(recepcion);
    }

}
