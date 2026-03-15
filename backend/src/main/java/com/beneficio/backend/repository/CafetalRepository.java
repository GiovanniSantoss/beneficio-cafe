package com.beneficio.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.beneficio.backend.model.Cafetal;

public interface CafetalRepository extends JpaRepository<Cafetal, Long> {
}