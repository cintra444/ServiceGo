package com.ServiceGo.api.dto.agendamento;

import com.ServiceGo.domain.enums.StatusAgendamento;
import java.time.OffsetDateTime;

public record AgendamentoViagemResponse(
        Long id,
        Long tripId,
        Long usuarioId,
        String usuarioNome,
        String titulo,
        String descricao,
        String localEvento,
        OffsetDateTime inicioEm,
        OffsetDateTime fimEm,
        String fusoHorario,
        Integer lembreteMinutos,
        String idEventoExterno,
        StatusAgendamento status,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
