package com.ServiceGo.api.erro;

import java.time.OffsetDateTime;
import java.util.Map;

public record ErroPadraoResponse(
        OffsetDateTime dataHora,
        int status,
        String titulo,
        String detalhe,
        String caminho,
        Map<String, String> errosValidacao
) {
}
