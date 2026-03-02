package com.ServiceGo.api.dto.trip;

import com.ServiceGo.domain.enums.TripStatus;
import com.ServiceGo.domain.enums.TripType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record TripRequest(
        Long customerId,
        @NotNull TripType tripType,
        @NotNull TripStatus status,
        @NotBlank @Size(max = 180) String origin,
        @NotBlank @Size(max = 180) String destination,
        @Size(max = 40) String appPlatform,
        @NotNull OffsetDateTime startAt,
        OffsetDateTime endAt,
        @DecimalMin("0.0") BigDecimal distanceKm,
        @DecimalMin("0.0") BigDecimal estimatedAmount,
        @DecimalMin("0.0") BigDecimal actualAmount,
        @Size(max = 600) String notes
) {
}
