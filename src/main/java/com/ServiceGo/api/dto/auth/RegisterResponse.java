package com.ServiceGo.api.dto.auth;

import com.ServiceGo.domain.enums.UserRole;
import java.time.OffsetDateTime;

public record RegisterResponse(
        Long id,
        String name,
        String email,
        UserRole role,
        boolean active,
        OffsetDateTime createdAt
) {
}
