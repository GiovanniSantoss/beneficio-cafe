package com.beneficio.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.beneficio.backend.model.Lote;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    Optional<Lote> findByRecepcionIdRecepcion(Long idRecepcion);

}