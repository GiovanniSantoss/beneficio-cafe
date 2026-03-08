package com.beneficio.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beneficio.backend.model.Productor;

public interface ProductorRepository extends JpaRepository<Productor, Long> {
}