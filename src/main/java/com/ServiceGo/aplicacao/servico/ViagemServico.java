package com.ServiceGo.aplicacao.servico;

import com.ServiceGo.api.dto.requisicao.corrida.CorridaAgendamentoRequest;
import com.ServiceGo.api.dto.requisicao.corrida.CorridaCancelamentoRequest;
import com.ServiceGo.api.dto.requisicao.corrida.CorridaConclusaoRequest;
import com.ServiceGo.dominio.modelo.Corrida;
import org.springframework.stereotype.Service;

@Service
public class ViagemServico {

    private final CorridaServico corridaServico;

    public ViagemServico(CorridaServico corridaServico) {
        this.corridaServico = corridaServico;
    }

    public Corrida agendarCorrida(CorridaAgendamentoRequest request) {
        return corridaServico.agendarCorrida(request);
    }

    public Corrida concluirCorrida(Long corridaId, CorridaConclusaoRequest request) {
        return corridaServico.concluirCorrida(corridaId, request);
    }

    public Corrida cancelarCorrida(Long corridaId, CorridaCancelamentoRequest request) {
        return corridaServico.cancelarCorrida(corridaId, request);
    }
}
