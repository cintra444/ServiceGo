package com.ServiceGo.api.dto.auth;

import com.ServiceGo.domain.enums.PlanType;
import com.ServiceGo.domain.enums.SubscriptionSource;
import com.ServiceGo.domain.enums.SubscriptionStatus;
import java.time.OffsetDateTime;

public record PlanResponse(
        PlanType type,
        SubscriptionStatus status,
        SubscriptionSource source,
        OffsetDateTime trialEndsAt,
        OffsetDateTime subscriptionEndsAt
) {
}
