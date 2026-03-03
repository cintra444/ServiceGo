package com.ServiceGo.api.dto.agendamento;

import com.ServiceGo.domain.enums.StatusAgendamento;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;

public record AgendamentoViagemRequest(
        @NotNull Long tripId,
        @NotNull Long usuarioId,
        @NotBlank @Size(max = 180) String titulo,
        @Size(max = 600) String descricao,
        @Size(max = 180) String localEvento,
        @NotNull OffsetDateTime inicioEm,
        OffsetDateTime fimEm,
        @NotBlank @Size(max = 80) String fusoHorario,
        Integer lembreteMinutos,
        @Size(max = 160) String idEventoExterno,
        @NotNull StatusAgendamento status
) {
}
