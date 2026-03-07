package com.ServiceGo.api.dto.veiculo;

import java.math.BigDecimal;

public record DepreciacaoKmResponse(
        BigDecimal depreciacaoTotal,
        BigDecimal depreciacaoPorKm
) {
}
