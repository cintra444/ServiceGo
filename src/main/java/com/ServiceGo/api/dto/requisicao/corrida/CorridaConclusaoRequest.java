package com.ServiceGo.api.dto.requisicao.corrida;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CorridaConclusaoRequest(
        @NotNull OffsetDateTime dataHoraInicio,
        @NotNull OffsetDateTime dataHoraFim,
        @NotNull @DecimalMin("0.0") BigDecimal valorBruto,
        @NotNull @DecimalMin("0.0") BigDecimal taxaPlataforma,
        @NotNull @DecimalMin("0.0") BigDecimal kmRodados,
        @Size(max = 600) String observacoesConclusao
) {
}
