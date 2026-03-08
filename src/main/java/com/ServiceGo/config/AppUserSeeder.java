package com.ServiceGo.config;

import com.ServiceGo.domain.entity.AppUser;
import com.ServiceGo.domain.enums.PlanType;
import com.ServiceGo.domain.enums.SubscriptionSource;
import com.ServiceGo.domain.enums.SubscriptionStatus;
import com.ServiceGo.domain.enums.UserRole;
import com.ServiceGo.domain.repository.AppUserRepository;
import java.time.OffsetDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AppUserSeeder implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final String defaultEmail;
    private final String defaultPassword;
    private final String defaultName;

    public AppUserSeeder(
            AppUserRepository appUserRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin.email}") String defaultEmail,
            @Value("${app.bootstrap.admin.password}") String defaultPassword,
            @Value("${app.bootstrap.admin.name}") String defaultName
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.defaultEmail = defaultEmail;
        this.defaultPassword = defaultPassword;
        this.defaultName = defaultName;
    }

    @Override
    public void run(String... args) {
        if (appUserRepository.count() > 0) {
            return;
        }

        AppUser admin = new AppUser();
        admin.setName(defaultName);
        admin.setEmail(defaultEmail);
        admin.setPasswordHash(passwordEncoder.encode(defaultPassword));
        admin.setRole(UserRole.ADMINISTRADOR);
        admin.setActive(true);
        admin.setCreatedAt(OffsetDateTime.now());
        admin.setPlanType(PlanType.PRO);
        admin.setSubscriptionStatus(SubscriptionStatus.TRIAL);
        admin.setSubscriptionSource(SubscriptionSource.MANUAL);
        admin.setTrialEndsAt(OffsetDateTime.now().plusDays(30));
        admin.setSubscriptionEndsAt(null);
        appUserRepository.save(admin);
    }
}
