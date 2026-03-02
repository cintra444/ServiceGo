package com.ServiceGo.api.dto.customer;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 20) String phone,
        @Size(max = 160) String email,
        @Size(max = 600) String notes
) {
}
