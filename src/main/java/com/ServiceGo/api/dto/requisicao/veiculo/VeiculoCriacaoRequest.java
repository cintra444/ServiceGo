package com.ServiceGo.api.dto.requisicao.veiculo;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record VeiculoCriacaoRequest(
        @NotBlank @Pattern(regexp = "^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$|^[A-Z]{3}[0-9]{4}$") String placa,
        @NotBlank @Size(max = 120) String modelo,
        @NotNull @Min(1980) @Max(2100) Integer ano,
        @NotNull @Min(0) Long kmAtual
) {
}
