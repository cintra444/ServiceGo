package com.ServiceGo.api.dto.configuracao;

import com.ServiceGo.domain.enums.DepreciacaoAlocacao;
import com.ServiceGo.domain.enums.DepreciacaoModo;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ConfiguracaoUsuarioRequest(
        @NotNull Boolean sincronizarCalendario,
        @NotNull Boolean lembreteAtivo,
        @NotNull @Min(1) @Max(1440) Integer minutosAntecedenciaLembrete,
        @NotBlank @Size(max = 80) String fusoHorario,
        @NotNull DepreciacaoModo depreciacaoModo,
        @NotNull DepreciacaoAlocacao depreciacaoAlocacao,
        @DecimalMin("0.0") BigDecimal valorAtualVeiculo,
        @DecimalMin("0.0") BigDecimal valorEstimadoVeiculo,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal kmBaseDepreciacao,
        @Min(1) Integer mesesBaseDepreciacao,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal anosBaseDepreciacao,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal valorManualPorKm,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal valorManualMensal,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal valorManualAnual
) {
}
