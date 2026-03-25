package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.Trip;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, Long> {
    @Override
    @EntityGraph(attributePaths = {"customer", "veiculo"})
    List<Trip> findAll();

    @Override
    @EntityGraph(attributePaths = {"customer", "veiculo", "veiculo.donoVeiculo"})
    Optional<Trip> findById(Long id);

    @EntityGraph(attributePaths = {"customer", "veiculo", "veiculo.donoVeiculo"})
    List<Trip> findByVeiculoDonoVeiculoIdOrderByStartAtDesc(Long usuarioId);

    @EntityGraph(attributePaths = {"customer", "veiculo", "veiculo.donoVeiculo"})
    Optional<Trip> findByIdAndVeiculoDonoVeiculoId(Long id, Long usuarioId);

    List<Trip> findByVeiculoDonoVeiculoIdAndStartAtBetween(Long usuarioId, OffsetDateTime inicio, OffsetDateTime fim);

    List<Trip> findByVeiculoDonoVeiculoIdAndVeiculoIdAndStartAtBetween(
            Long usuarioId,
            Long veiculoId,
            OffsetDateTime inicio,
            OffsetDateTime fim
    );
}
