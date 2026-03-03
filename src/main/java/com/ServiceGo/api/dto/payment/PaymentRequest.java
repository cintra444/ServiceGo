package com.ServiceGo.api.dto.payment;

import com.ServiceGo.domain.enums.PaymentMethod;
import com.ServiceGo.domain.enums.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PaymentRequest(
        Long tripId,
        Long customerId,
        @NotNull PaymentMethod method,
        @NotNull PaymentStatus status,
        @NotNull @DecimalMin("0.0") BigDecimal amount,
        boolean pagamentoParcial,
        @Min(1) Integer numeroParcela,
        OffsetDateTime paidAt,
        OffsetDateTime dueAt,
        @Size(max = 100) String referenceCode,
        @Size(max = 600) String notes
) {
}
