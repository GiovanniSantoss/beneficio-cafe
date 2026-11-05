package com.beneficio.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.beneficio.backend.model.Inventario;

import jakarta.persistence.LockModeType;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {

    Optional<Inventario> findByLoteIdLote(Long idLote);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from Inventario i where i.lote.idLote = :idLote")
    Optional<Inventario> findByLoteIdLoteForUpdate(@Param("idLote") Long idLote);

    @Query("""
            select i from Inventario i
            join fetch i.lote l
            join fetch l.recepcion r
            join fetch r.productor
            join fetch r.cafetal
            """)
    List<Inventario> findAllConDetalle();
}
