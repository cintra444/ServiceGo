package com.ServiceGo.aplicacao.servico;

import com.ServiceGo.api.dto.auth.ChangePasswordRequest;
import com.ServiceGo.api.dto.auth.LoginRequest;
import com.ServiceGo.api.dto.auth.LoginResponse;
import com.ServiceGo.api.dto.auth.RegisterRequest;
import com.ServiceGo.api.dto.auth.RegisterResponse;
import com.ServiceGo.api.dto.auth.UserStatusUpdateRequest;
import com.ServiceGo.dominio.excecao.ConflitoNegocioException;
import com.ServiceGo.dominio.excecao.RegraNegocioException;
import com.ServiceGo.dominio.excecao.RecursoNaoEncontradoException;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.AppUserRepository;
import com.ServiceGo.infraestrutura.seguranca.JwtService;
import java.time.OffsetDateTime;
import java.util.Locale;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AutenticacaoServico {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioServico usuarioServico;

    public AutenticacaoServico(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            UsuarioServico usuarioServico
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.usuarioServico = usuarioServico;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(Locale.ROOT), request.password())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtService.generateToken(userDetails);
            String role = userDetails.getAuthorities().stream().findFirst()
                    .map(grantedAuthority -> grantedAuthority.getAuthority())
                    .orElse("ROLE_DRIVER");
            return new LoginResponse(token, "Bearer", userDetails.getUsername(), role);
        } catch (BadCredentialsException ex) {
            throw new RegraNegocioException("Credenciais invalidas");
        }
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        if (appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ConflitoNegocioException("Email ja em uso");
        }

        AppUser user = new AppUser();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role() == null ? UserRole.DRIVER : request.role());
        user.setActive(true);
        user.setCreatedAt(OffsetDateTime.now());
        AppUser saved = appUserRepository.save(user);
        return toRegisterResponse(saved);
    }

    @Transactional
    public RegisterResponse updateStatus(Long id, UserStatusUpdateRequest request) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado"));

        if (user.getRole() == UserRole.ADMIN && !request.active()) {
            usuarioServico.validarDesativacaoUltimoAdmin(user.getId());
        }

        user.setActive(request.active());
        AppUser saved = appUserRepository.save(user);
        return toRegisterResponse(saved);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, String emailAutenticado) {
        String email = emailAutenticado.trim().toLowerCase(Locale.ROOT);
        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuario nao encontrado"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new RegraNegocioException("Senha atual invalida");
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new RegraNegocioException("Nova senha deve ser diferente da atual");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        appUserRepository.save(user);
    }

    private RegisterResponse toRegisterResponse(AppUser user) {
        return new RegisterResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
