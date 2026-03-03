package com.ServiceGo.api.dto.veiculo;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record VeiculoRequest(
        @NotBlank @Size(max = 120) String modelo,
        @NotBlank @Size(max = 10) String placa,
        @NotNull @Min(1900) @Max(2100) Integer ano,
        @Size(max = 40) String cor,
        @NotNull Boolean ativo,
        @NotNull @DecimalMin("0.0") BigDecimal kmAtual,
        @NotNull Long donoUsuarioId
) {
}
