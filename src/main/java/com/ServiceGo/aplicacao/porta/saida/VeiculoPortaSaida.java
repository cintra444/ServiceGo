package com.ServiceGo.aplicacao.porta.saida;

import com.ServiceGo.dominio.modelo.Veiculo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VeiculoPortaSaida {

    Page<Veiculo> listar(String placa, String modelo, Pageable pageable);

    Veiculo buscarPorId(Long veiculoId);

    Veiculo salvar(Veiculo veiculo);

    void remover(Veiculo veiculo);

    boolean existePlaca(String placa);

    boolean existePlacaOutroVeiculo(String placa, Long veiculoId);
}
