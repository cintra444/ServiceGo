package com.ServiceGo.api.dto.requisicao.corrida;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public record CorridaCancelamentoRequest(
        @NotBlank @Size(max = 600) String motivoCancelamento,
        @NotNull OffsetDateTime dataHoraCancelamento
) {
}
