package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.Expense;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByVeiculoDonoVeiculoIdAndOccurredAtBetween(Long usuarioId, OffsetDateTime inicio, OffsetDateTime fim);

    List<Expense> findByVeiculoDonoVeiculoIdAndVeiculoIdAndOccurredAtBetween(
            Long usuarioId,
            Long veiculoId,
            OffsetDateTime inicio,
            OffsetDateTime fim
    );
}
