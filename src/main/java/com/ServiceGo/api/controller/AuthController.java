package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.auth.ChangePasswordRequest;
import com.ServiceGo.api.dto.auth.LoginRequest;
import com.ServiceGo.api.dto.auth.LoginResponse;
import com.ServiceGo.api.dto.auth.RegisterRequest;
import com.ServiceGo.api.dto.auth.RegisterResponse;
import com.ServiceGo.api.dto.auth.UserStatusUpdateRequest;
import com.ServiceGo.aplicacao.servico.AutenticacaoServico;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AutenticacaoServico autenticacaoServico;

    public AuthController(AutenticacaoServico autenticacaoServico) {
        this.autenticacaoServico = autenticacaoServico;
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return autenticacaoServico.login(request);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return autenticacaoServico.register(request);
    }

    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.OK)
    public RegisterResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequest request) {
        return autenticacaoServico.updateStatus(id, request);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        autenticacaoServico.changePassword(request, authentication.getName());
    }
}
