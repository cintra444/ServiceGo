package com.ServiceGo.infraestrutura.persistencia.adaptador;

import com.ServiceGo.aplicacao.porta.saida.DespesaCorridaPortaSaida;
import com.ServiceGo.dominio.excecao.RecursoNaoEncontradoException;
import com.ServiceGo.dominio.modelo.DespesaCorrida;
import com.ServiceGo.infraestrutura.persistencia.repositorio.DespesaCorridaRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DespesaCorridaAdaptador implements DespesaCorridaPortaSaida {

    private final DespesaCorridaRepository despesaCorridaRepository;

    public DespesaCorridaAdaptador(DespesaCorridaRepository despesaCorridaRepository) {
        this.despesaCorridaRepository = despesaCorridaRepository;
    }

    @Override
    public DespesaCorrida salvar(DespesaCorrida despesaCorrida) {
        return despesaCorridaRepository.save(despesaCorrida);
    }

    @Override
    public List<DespesaCorrida> listarPorCorrida(Long corridaId) {
        return despesaCorridaRepository.findByCorridaCorridaId(corridaId);
    }

    @Override
    public DespesaCorrida buscarPorId(Long corridaId, Long despesaId) {
        return despesaCorridaRepository.findByDespesaIdAndCorridaCorridaId(despesaId, corridaId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Despesa da corrida nao encontrada"));
    }

    @Override
    public void remover(DespesaCorrida despesaCorrida) {
        despesaCorridaRepository.delete(despesaCorrida);
    }

    @Override
    public BigDecimal somarPorCorridaId(Long corridaId) {
        return despesaCorridaRepository.somarDespesasPorCorridaId(corridaId);
    }
}
