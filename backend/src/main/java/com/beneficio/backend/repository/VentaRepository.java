package com.beneficio.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beneficio.backend.model.Venta;

public interface VentaRepository extends JpaRepository<Venta, Long> {
}