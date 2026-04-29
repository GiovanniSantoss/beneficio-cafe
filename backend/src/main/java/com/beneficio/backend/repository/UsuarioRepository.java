package com.beneficio.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.beneficio.backend.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}