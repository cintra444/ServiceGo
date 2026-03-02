package com.ServiceGo.api.dto.resposta.cliente;

import java.time.OffsetDateTime;

public record ClienteResponse(
        Long clienteId,
        String nome,
        String telefone,
        String email,
        String observacoes,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm
) {
}
