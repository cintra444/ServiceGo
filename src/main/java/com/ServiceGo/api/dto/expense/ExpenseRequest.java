package com.ServiceGo.api.dto.expense;

import com.ServiceGo.domain.enums.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ExpenseRequest(
        Long tripId,
        @NotNull Long veiculoId,
        @NotNull ExpenseCategory category,
        @NotNull @DecimalMin("0.0") BigDecimal amount,
        @Size(max = 600) String description,
        @NotNull OffsetDateTime occurredAt
) {
}
