package com.ServiceGo.api.dto.customer;

import java.time.OffsetDateTime;

public record CustomerResponse(
        Long id,
        String name,
        String phone,
        String email,
        String notes,
        OffsetDateTime createdAt
) {
}
