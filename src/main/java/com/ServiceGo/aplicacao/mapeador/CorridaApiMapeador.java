package com.ServiceGo.aplicacao.mapeador;

import com.ServiceGo.api.dto.resposta.corrida.CorridaResponse;
import com.ServiceGo.dominio.modelo.Corrida;
import org.springframework.stereotype.Component;

@Component
public class CorridaApiMapeador {

    public CorridaResponse paraResponse(Corrida corrida) {
        return new CorridaResponse(
                corrida.getCorridaId(),
                corrida.getCliente().getClienteId(),
                corrida.getVeiculo().getVeiculoId(),
                corrida.getOrigem(),
                corrida.getDestino(),
                corrida.getDataHoraAgendada(),
                corrida.getStatus(),
                corrida.getFonte(),
                corrida.getTipo(),
                corrida.getValorBruto(),
                corrida.getTaxaPlataforma(),
                corrida.getKmRodados(),
                corrida.getValorLiquido(),
                corrida.getDespesas(),
                corrida.getLucro(),
                corrida.getObservacoes(),
                corrida.getMotivoCancelamento(),
                corrida.getDataHoraCancelamento(),
                corrida.getCriadoEm(),
                corrida.getAtualizadoEm()
        );
    }
}
