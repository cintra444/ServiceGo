package com.ServiceGo.aplicacao.mapeador;

import com.ServiceGo.api.dto.resposta.despesa.DespesaCorridaResponse;
import com.ServiceGo.dominio.modelo.DespesaCorrida;
import org.springframework.stereotype.Component;

@Component
public class DespesaApiMapeador {

    public DespesaCorridaResponse paraResponse(DespesaCorrida despesa) {
        return new DespesaCorridaResponse(
                despesa.getDespesaId(),
                despesa.getCorrida().getCorridaId(),
                despesa.getTipoDespesa(),
                despesa.getDescricao(),
                despesa.getValor(),
                despesa.getDataHora(),
                despesa.getCriadoEm(),
                despesa.getAtualizadoEm()
        );
    }
}
