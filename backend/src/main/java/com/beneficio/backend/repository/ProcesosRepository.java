package com.beneficio.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beneficio.backend.model.Procesos;

public interface ProcesosRepository extends JpaRepository<Procesos, Long> {

    // 🔍 Buscar procesos por lote
    List<Procesos> findByLote_IdLote(Long idLote);

}