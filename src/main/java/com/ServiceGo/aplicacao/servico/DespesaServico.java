package com.ServiceGo.aplicacao.servico;

import com.ServiceGo.api.dto.requisicao.despesa.DespesaCorridaCriacaoRequest;
import com.ServiceGo.dominio.modelo.DespesaCorrida;
import org.springframework.stereotype.Service;

@Service
public class DespesaServico {

    private final DespesaCorridaServico despesaCorridaServico;

    public DespesaServico(DespesaCorridaServico despesaCorridaServico) {
        this.despesaCorridaServico = despesaCorridaServico;
    }

    public DespesaCorrida adicionarDespesa(Long corridaId, DespesaCorridaCriacaoRequest request) {
        return despesaCorridaServico.adicionarDespesa(corridaId, request);
    }
}
