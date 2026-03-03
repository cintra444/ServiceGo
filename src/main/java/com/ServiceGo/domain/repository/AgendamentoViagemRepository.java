package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.AgendamentoViagem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoViagemRepository extends JpaRepository<AgendamentoViagem, Long> {

    List<AgendamentoViagem> findByUsuarioIdOrderByInicioEmAsc(Long usuarioId);

    Optional<AgendamentoViagem> findByTripId(Long tripId);
}
