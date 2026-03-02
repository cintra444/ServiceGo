package com.ServiceGo.api.dto.payment;

import com.ServiceGo.domain.enums.PaymentMethod;
import com.ServiceGo.domain.enums.PaymentStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record PaymentResponse(
        Long id,
        Long tripId,
        Long customerId,
        PaymentMethod method,
        PaymentStatus status,
        BigDecimal amount,
        OffsetDateTime paidAt,
        OffsetDateTime dueAt,
        String referenceCode,
        String notes
) {
}
