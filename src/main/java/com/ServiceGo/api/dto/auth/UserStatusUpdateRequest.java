package com.ServiceGo.api.dto.auth;

import jakarta.validation.constraints.NotNull;

public record UserStatusUpdateRequest(
        @NotNull Boolean active
) {
}
