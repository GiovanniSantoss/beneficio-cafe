package com.beneficio.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.beneficio.backend.model.Lote;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

}