package com.ServiceGo.api.dto.trip;

import com.ServiceGo.domain.enums.TripStatus;
import com.ServiceGo.domain.enums.TripType;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record TripResponse(
        Long id,
        Long customerId,
        String customerName,
        TripType tripType,
        TripStatus status,
        String origin,
        String destination,
        String appPlatform,
        OffsetDateTime startAt,
        OffsetDateTime endAt,
        BigDecimal distanceKm,
        BigDecimal estimatedAmount,
        BigDecimal actualAmount,
        String notes,
        OffsetDateTime createdAt
) {
}
