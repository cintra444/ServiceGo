import type { SubscriptionPlan } from "../types/api";

export function hasPremiumAccess(plan?: SubscriptionPlan) {
  if (!plan) {
    return false;
  }
  if (plan.type !== "PRO") {
    return false;
  }
  if (plan.status === "ACTIVE") {
    return true;
  }
  if (plan.status === "TRIAL") {
    if (!plan.trialEndsAt) {
      return true;
    }
    return new Date(plan.trialEndsAt).getTime() > Date.now();
  }
  return false;
}
