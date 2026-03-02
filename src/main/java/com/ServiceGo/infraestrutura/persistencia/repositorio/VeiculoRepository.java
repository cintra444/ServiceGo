package com.ServiceGo.infraestrutura.persistencia.repositorio;

import com.ServiceGo.dominio.modelo.Veiculo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VeiculoRepository extends JpaRepository<Veiculo, Long> {

    Page<Veiculo> findByPlacaContainingIgnoreCaseAndModeloContainingIgnoreCase(String placa, String modelo, Pageable pageable);

    boolean existsByPlacaIgnoreCase(String placa);

    boolean existsByPlacaIgnoreCaseAndVeiculoIdNot(String placa, Long veiculoId);
}
