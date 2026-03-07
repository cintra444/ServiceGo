package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.Trip;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByVeiculoDonoVeiculoIdAndStartAtBetween(Long usuarioId, OffsetDateTime inicio, OffsetDateTime fim);

    List<Trip> findByVeiculoDonoVeiculoIdAndVeiculoIdAndStartAtBetween(
            Long usuarioId,
            Long veiculoId,
            OffsetDateTime inicio,
            OffsetDateTime fim
    );
}
