package com.ServiceGo.api.dto.configuracao;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ConfiguracaoUsuarioRequest(
        @NotNull Boolean sincronizarCalendario,
        @NotNull Boolean lembreteAtivo,
        @NotNull @Min(1) @Max(1440) Integer minutosAntecedenciaLembrete,
        @NotBlank @Size(max = 80) String fusoHorario
) {
}
