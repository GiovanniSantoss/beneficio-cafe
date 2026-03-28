package com.beneficio.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.beneficio.backend.model.Recepcion;

@Repository
public interface RecepcionRepository extends JpaRepository<Recepcion, Long> {

}
