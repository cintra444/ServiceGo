package com.ServiceGo.api.dto.resposta.corrida;

import com.ServiceGo.dominio.enumeracao.FonteCorrida;
import com.ServiceGo.dominio.enumeracao.StatusCorrida;
import com.ServiceGo.dominio.enumeracao.TipoCorrida;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CorridaResponse(
        Long corridaId,
        Long clienteId,
        Long veiculoId,
        String origem,
        String destino,
        OffsetDateTime dataHoraAgendada,
        StatusCorrida status,
        FonteCorrida fonte,
        TipoCorrida tipo,
        BigDecimal valorBruto,
        BigDecimal taxaPlataforma,
        BigDecimal kmRodados,
        BigDecimal valorLiquido,
        BigDecimal despesas,
        BigDecimal lucro,
        String observacoes,
        String motivoCancelamento,
        OffsetDateTime dataHoraCancelamento,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
