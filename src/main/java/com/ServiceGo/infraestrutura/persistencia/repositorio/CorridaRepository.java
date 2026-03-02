package com.ServiceGo.infraestrutura.persistencia.repositorio;

import com.ServiceGo.dominio.enumeracao.FonteCorrida;
import com.ServiceGo.dominio.modelo.Corrida;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CorridaRepository extends JpaRepository<Corrida, Long>, JpaSpecificationExecutor<Corrida> {

    Optional<Corrida> findByCorridaIdAndClienteClienteId(Long corridaId, Long clienteId);
}
