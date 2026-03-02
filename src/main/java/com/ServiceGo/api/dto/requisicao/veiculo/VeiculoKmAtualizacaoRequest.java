package com.ServiceGo.api.dto.requisicao.veiculo;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record VeiculoKmAtualizacaoRequest(
        @NotNull @Min(0) Long kmAtual
) {
}
