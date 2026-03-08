package com.ServiceGo.security;

import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.enums.PlanType;
import com.ServiceGo.domain.enums.SubscriptionStatus;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.AppUserRepository;
import java.time.OffsetDateTime;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PlanAccessService {

    private final AppUserRepository appUserRepository;

    public PlanAccessService(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    public AppUser getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        return appUserRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }

    public void ensureUserCanAccess(Long targetUserId, Authentication authentication) {
        AppUser authenticatedUser = getAuthenticatedUser(authentication);
        if (authenticatedUser.getRole() == UserRole.ADMINISTRADOR) {
            return;
        }
        if (!authenticatedUser.getId().equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User cannot access this resource");
        }
    }

    public void ensurePremiumUser(Long targetUserId, Authentication authentication) {
        AppUser authenticatedUser = getAuthenticatedUser(authentication);
        if (authenticatedUser.getRole() != UserRole.ADMINISTRADOR && !authenticatedUser.getId().equals(targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User cannot access this resource");
        }
        if (!hasPremiumAccess(authenticatedUser)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Plano Pro obrigatório para este recurso");
        }
    }

    public boolean hasPremiumAccess(AppUser user) {
        if (user == null || user.getPlanType() != PlanType.PRO) {
            return false;
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (user.getSubscriptionStatus() == SubscriptionStatus.ACTIVE) {
            return user.getSubscriptionEndsAt() == null || user.getSubscriptionEndsAt().isAfter(now);
        }
        if (user.getSubscriptionStatus() == SubscriptionStatus.TRIAL) {
            return user.getTrialEndsAt() == null || user.getTrialEndsAt().isAfter(now);
        }
        return false;
    }
}
