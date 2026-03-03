package com.ServiceGo.domain.repository;

import com.ServiceGo.domain.entity.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {

    boolean existsByPlacaIgnoreCase(String placa);
}
