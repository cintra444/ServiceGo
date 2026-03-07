package com.ServiceGo.api.dto.veiculo;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record DepreciacaoKmRequest(
        @NotNull @DecimalMin("0.0") BigDecimal valorAtual,
        @NotNull @DecimalMin("0.0") BigDecimal valorEstimado,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal kmRodado
) {
}
