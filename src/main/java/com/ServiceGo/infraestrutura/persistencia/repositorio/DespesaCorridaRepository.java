package com.ServiceGo.infraestrutura.persistencia.repositorio;

import com.ServiceGo.dominio.modelo.DespesaCorrida;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface DespesaCorridaRepository extends JpaRepository<DespesaCorrida, Long> {

    List<DespesaCorrida> findByCorridaCorridaId(Long corridaId);

    Optional<DespesaCorrida> findByDespesaIdAndCorridaCorridaId(Long despesaId, Long corridaId);

    @Query("select coalesce(sum(d.valor), 0) from DespesaCorrida d where d.corrida.corridaId = :corridaId")
    BigDecimal somarDespesasPorCorridaId(Long corridaId);
}
