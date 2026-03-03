package com.ServiceGo.api.dto.expense;

import com.ServiceGo.domain.enums.ExpenseCategory;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ExpenseResponse(
        Long id,
        Long tripId,
        Long veiculoId,
        String veiculoPlaca,
        ExpenseCategory category,
        BigDecimal amount,
        String description,
        OffsetDateTime occurredAt
) {
}
