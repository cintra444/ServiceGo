package com.ServiceGo.api.dto.resposta.despesa;

import com.ServiceGo.dominio.enumeracao.TipoDespesa;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record DespesaCorridaResponse(
        Long despesaId,
        Long corridaId,
        TipoDespesa tipoDespesa,
        String descricao,
        BigDecimal valor,
        OffsetDateTime dataHora,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
