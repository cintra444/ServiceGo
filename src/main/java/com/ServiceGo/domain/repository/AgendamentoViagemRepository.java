package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.AgendamentoViagem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoViagemRepository extends JpaRepository<AgendamentoViagem, Long> {

    @Override
    @EntityGraph(attributePaths = {"trip", "usuario"})
    List<AgendamentoViagem> findAll();

    @Override
    @EntityGraph(attributePaths = {"trip", "usuario"})
    Optional<AgendamentoViagem> findById(Long id);

    @EntityGraph(attributePaths = {"trip", "usuario"})
    List<AgendamentoViagem> findByUsuarioIdOrderByInicioEmDesc(Long usuarioId);

    @EntityGraph(attributePaths = {"trip", "usuario"})
    List<AgendamentoViagem> findByUsuarioIdOrderByInicioEmAsc(Long usuarioId);

    @EntityGraph(attributePaths = {"trip", "usuario"})
    Optional<AgendamentoViagem> findByIdAndUsuarioId(Long id, Long usuarioId);

    @EntityGraph(attributePaths = {"trip", "usuario"})
    Optional<AgendamentoViagem> findByTripId(Long tripId);
}
