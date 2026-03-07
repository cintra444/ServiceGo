package com.ServiceGo.api.dto.relatorio;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record RelatorioFinanceiroResponse(
        Long usuarioId,
        Long veiculoId,
        OffsetDateTime periodoInicio,
        OffsetDateTime periodoFim,
        Long totalCorridas,
        BigDecimal kmTotal,
        BigDecimal receitaTotal,
        BigDecimal custosVariaveisTotal,
        BigDecimal depreciacaoTotalPeriodo,
        BigDecimal custoOperacionalTotal,
        BigDecimal custoOperacionalPorKm,
        BigDecimal lucroTotal,
        BigDecimal lucroPorKm,
        BigDecimal lucroPorCorrida,
        BigDecimal lucroPorDia,
        BigDecimal lucroPorMes
) {
}
