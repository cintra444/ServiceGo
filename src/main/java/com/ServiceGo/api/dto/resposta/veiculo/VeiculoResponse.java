package com.ServiceGo.api.dto.resposta.veiculo;

import java.time.OffsetDateTime;

public record VeiculoResponse(
        Long veiculoId,
        String placa,
        String modelo,
        Integer ano,
        Long kmAtual,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
