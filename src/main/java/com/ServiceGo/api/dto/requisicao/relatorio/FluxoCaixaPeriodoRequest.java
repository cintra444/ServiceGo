package com.ServiceGo.api.dto.requisicao.relatorio;

import com.ServiceGo.dominio.enumeracao.FonteCorrida;
import com.ServiceGo.dominio.enumeracao.TipoCorrida;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

public record FluxoCaixaPeriodoRequest(
        @NotNull OffsetDateTime dataHoraInicio,
        @NotNull OffsetDateTime dataHoraFim,
        FonteCorrida fonte,
        TipoCorrida tipo,
        Long clienteId,
        Long veiculoId,
        int pagina,
        int tamanho
) {
}
