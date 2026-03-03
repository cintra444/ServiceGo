package com.ServiceGo.api.dto.veiculo;

import java.math.BigDecimal;

public record VeiculoResponse(
        Long id,
        String modelo,
        String placa,
        Integer ano,
        String cor,
        boolean ativo,
        BigDecimal kmAtual,
        Long donoUsuarioId,
        String donoNome
) {
}
