package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.Veiculo;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {

    @Override
    @EntityGraph(attributePaths = "donoVeiculo")
    List<Veiculo> findAll();

    @Override
    @EntityGraph(attributePaths = "donoVeiculo")
    Optional<Veiculo> findById(Long id);

    boolean existsByPlacaIgnoreCase(String placa);

    @EntityGraph(attributePaths = "donoVeiculo")
    List<Veiculo> findByDonoVeiculoIdOrderByModeloAsc(Long donoVeiculoId);

    @EntityGraph(attributePaths = "donoVeiculo")
    Optional<Veiculo> findByIdAndDonoVeiculoId(Long id, Long donoVeiculoId);
}
