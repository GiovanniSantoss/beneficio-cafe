package com.beneficio.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.beneficio.backend.model.Lote;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {

    Optional<Lote> findByRecepcionIdRecepcion(Long idRecepcion);

    @Query("""
            select l from Lote l
            join fetch l.recepcion r
            join fetch r.productor
            join fetch r.cafetal
            """)
    List<Lote> findAllConDetalle();

}
