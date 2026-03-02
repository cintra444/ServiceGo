package com.ServiceGo.aplicacao.porta.saida;

import com.ServiceGo.dominio.modelo.Corrida;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

public interface CorridaPortaSaida {

    Corrida buscarPorId(Long corridaId);

    Corrida salvar(Corrida corrida);

    Page<Corrida> listar(Specification<Corrida> specification, Pageable pageable);
}
