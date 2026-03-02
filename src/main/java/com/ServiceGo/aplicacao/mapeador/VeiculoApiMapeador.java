package com.ServiceGo.aplicacao.mapeador;

import com.ServiceGo.api.dto.resposta.veiculo.VeiculoResponse;
import com.ServiceGo.dominio.modelo.Veiculo;
import org.springframework.stereotype.Component;

@Component
public class VeiculoApiMapeador {

    public VeiculoResponse paraResponse(Veiculo veiculo) {
        return new VeiculoResponse(
                veiculo.getVeiculoId(),
                veiculo.getPlaca(),
                veiculo.getModelo(),
                veiculo.getAno(),
                veiculo.getKmAtual(),
                veiculo.getCriadoEm(),
                veiculo.getAtualizadoEm()
        );
    }
}
