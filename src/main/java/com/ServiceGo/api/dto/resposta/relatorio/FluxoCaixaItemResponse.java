package com.ServiceGo.api.dto.resposta.relatorio;

import com.ServiceGo.dominio.enumeracao.FonteCorrida;
import com.ServiceGo.dominio.enumeracao.StatusCorrida;
import com.ServiceGo.dominio.enumeracao.TipoCorrida;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record FluxoCaixaItemResponse(
        Long corridaId,
        OffsetDateTime dataHoraAgendada,
        Long clienteId,
        FonteCorrida fonte,
        TipoCorrida tipo,
        BigDecimal valorBruto,
        BigDecimal taxaPlataforma,
        BigDecimal valorLiquido,
        BigDecimal despesas,
        BigDecimal lucro,
        StatusCorrida status
) {
}
