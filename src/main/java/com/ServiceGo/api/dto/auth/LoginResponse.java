package com.ServiceGo.api.dto.auth;

public record LoginResponse(
        String token,
        String tokenType,
        String email,
        String role
) {
}
