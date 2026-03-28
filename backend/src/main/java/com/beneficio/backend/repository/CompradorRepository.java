package com.beneficio.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beneficio.backend.model.Comprador;

public interface CompradorRepository extends JpaRepository<Comprador, Long> {
}