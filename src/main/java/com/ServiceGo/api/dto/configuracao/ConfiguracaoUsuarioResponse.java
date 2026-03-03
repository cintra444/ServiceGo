package com.ServiceGo.api.dto.configuracao;

public record ConfiguracaoUsuarioResponse(
        Long id,
        Long usuarioId,
        boolean sincronizarCalendario,
        boolean lembreteAtivo,
        Integer minutosAntecedenciaLembrete,
        String fusoHorario
) {
}
