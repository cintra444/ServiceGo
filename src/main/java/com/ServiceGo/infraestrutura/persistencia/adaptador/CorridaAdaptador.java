package com.ServiceGo.infraestrutura.persistencia.adaptador;

import com.ServiceGo.aplicacao.porta.saida.CorridaPortaSaida;
import com.ServiceGo.dominio.excecao.RecursoNaoEncontradoException;
import com.ServiceGo.dominio.modelo.Corrida;
import com.ServiceGo.infraestrutura.persistencia.repositorio.CorridaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

@Component
public class CorridaAdaptador implements CorridaPortaSaida {

    private final CorridaRepository corridaRepository;

    public CorridaAdaptador(CorridaRepository corridaRepository) {
        this.corridaRepository = corridaRepository;
    }

    @Override
    public Corrida buscarPorId(Long corridaId) {
        return corridaRepository.findById(corridaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Corrida nao encontrada"));
    }

    @Override
    public Corrida salvar(Corrida corrida) {
        return corridaRepository.save(corrida);
    }

    @Override
    public Page<Corrida> listar(Specification<Corrida> specification, Pageable pageable) {
        return corridaRepository.findAll(specification, pageable);
    }
}
