package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.Expense;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    @Override
    @EntityGraph(attributePaths = {"trip", "veiculo"})
    List<Expense> findAll();

    @Override
    @EntityGraph(attributePaths = {"trip", "veiculo"})
    Optional<Expense> findById(Long id);

    @EntityGraph(attributePaths = {"trip", "veiculo"})
    List<Expense> findByVeiculoDonoVeiculoIdOrderByOccurredAtDesc(Long usuarioId);

    @EntityGraph(attributePaths = {"trip", "veiculo"})
    Optional<Expense> findByIdAndVeiculoDonoVeiculoId(Long id, Long usuarioId);

    @EntityGraph(attributePaths = {"trip", "veiculo"})
    List<Expense> findByTripId(Long tripId);

    List<Expense> findByVeiculoDonoVeiculoIdAndOccurredAtBetween(Long usuarioId, OffsetDateTime inicio, OffsetDateTime fim);

    List<Expense> findByVeiculoDonoVeiculoIdAndVeiculoIdAndOccurredAtBetween(
            Long usuarioId,
            Long veiculoId,
            OffsetDateTime inicio,
            OffsetDateTime fim
    );
}
