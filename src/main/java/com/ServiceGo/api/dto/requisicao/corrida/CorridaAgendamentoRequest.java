package com.ServiceGo.api.dto.requisicao.corrida;

import com.ServiceGo.dominio.enumeracao.FonteCorrida;
import com.ServiceGo.dominio.enumeracao.TipoCorrida;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record CorridaAgendamentoRequest(
        @NotNull Long clienteId,
        @NotNull Long veiculoId,
        @NotBlank @Size(max = 180) String origem,
        @NotBlank @Size(max = 180) String destino,
        @NotNull OffsetDateTime dataHoraAgendada,
        @NotNull FonteCorrida fonte,
        @NotNull TipoCorrida tipo,
        @NotNull @DecimalMin("0.0") BigDecimal valorBrutoEstimado,
        @NotNull @DecimalMin("0.0") BigDecimal taxaPlataformaEstimada,
        @Size(max = 600) String observacoes
) {
}
