package com.ServiceGo.api.dto.requisicao.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClienteCriacaoRequest(
        @NotBlank @Size(max = 120) String nome,
        @Size(max = 20) String telefone,
        @Email @Size(max = 160) String email,
        @Size(max = 600) String observacoes
) {
}
