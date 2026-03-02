package com.ServiceGo.api.dto.resposta.relatorio;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record FluxoCaixaResumoResponse(
        OffsetDateTime dataHoraInicio,
        OffsetDateTime dataHoraFim,
        long totalCorridas,
        BigDecimal totalValorBruto,
        BigDecimal totalTaxaPlataforma,
        BigDecimal totalValorLiquido,
        BigDecimal totalDespesas,
        BigDecimal totalLucro,
        BigDecimal ticketMedioLiquido
) {
}
