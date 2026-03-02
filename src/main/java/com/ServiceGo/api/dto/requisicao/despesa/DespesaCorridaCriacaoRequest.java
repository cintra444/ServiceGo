package com.ServiceGo.api.dto.requisicao.despesa;

import com.ServiceGo.dominio.enumeracao.TipoDespesa;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record DespesaCorridaCriacaoRequest(
        @NotNull TipoDespesa tipoDespesa,
        @Size(max = 600) String descricao,
        @NotNull @DecimalMin("0.01") BigDecimal valor,
        @NotNull OffsetDateTime dataHora
) {
}
