package com.ServiceGo.api.controller;

import com.ServiceGo.api.dto.auth.ChangePasswordRequest;
import com.ServiceGo.api.dto.auth.LoginRequest;
import com.ServiceGo.api.dto.auth.LoginResponse;
import com.ServiceGo.api.dto.auth.RegisterRequest;
import com.ServiceGo.api.dto.auth.RegisterResponse;
import com.ServiceGo.api.dto.auth.UserStatusUpdateRequest;
import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.AppUserRepository;
import com.ServiceGo.security.JwtService;
import java.time.OffsetDateTime;
import java.util.Locale;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    @ResponseStatus(HttpStatus.OK)
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(Locale.ROOT), request.password())
            );
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            AppUser user = appUserRepository.findByEmailIgnoreCase(userDetails.getUsername())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            String token = jwtService.generateToken(userDetails, user.getId());
            String role = userDetails.getAuthorities().stream().findFirst()
                    .map(grantedAuthority -> grantedAuthority.getAuthority())
                    .orElse("ROLE_MOTORISTA");
            return new LoginResponse(token, "Bearer", userDetails.getUsername(), role, user.getId());
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        if (appUserRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        AppUser user = new AppUser();
        user.setName(request.name().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role() == null ? UserRole.MOTORISTA : request.role());
        user.setActive(true);
        user.setCreatedAt(OffsetDateTime.now());
        AppUser saved = appUserRepository.save(user);
        return toRegisterResponse(saved);
    }

    @PutMapping("/users/{id}/status")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @ResponseStatus(HttpStatus.OK)
    public RegisterResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequest request) {
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() == UserRole.ADMINISTRADOR && !request.active() && isLastActiveAdmin(user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot deactivate the last active admin");
        }

        user.setActive(request.active());
        AppUser saved = appUserRepository.save(user);
        return toRegisterResponse(saved);
    }

    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody ChangePasswordRequest request, Authentication authentication) {
        String email = authentication.getName().trim().toLowerCase(Locale.ROOT);
        AppUser user = appUserRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is invalid");
        }

        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must be different");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        appUserRepository.save(user);
    }

    private boolean isLastActiveAdmin(Long userIdToIgnore) {
        return appUserRepository.findAll().stream()
                .filter(AppUser::isActive)
                .filter(appUser -> appUser.getRole() == UserRole.ADMINISTRADOR)
                .filter(appUser -> !appUser.getId().equals(userIdToIgnore))
                .findAny()
                .isEmpty();
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
