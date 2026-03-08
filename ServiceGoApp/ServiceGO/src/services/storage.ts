import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SubscriptionPlan } from "../types/api";

const TOKEN_KEY = "@servicego/token";
const EMAIL_KEY = "@servicego/email";
const ROLE_KEY = "@servicego/role";
const USER_ID_KEY = "@servicego/user_id";
const PLAN_KEY = "@servicego/plan";
const FUEL_PRICE_KEY = "@servicego/fuel_price";
const FUEL_EFFICIENCY_KEY = "@servicego/fuel_efficiency";

export interface StoredSession {
  token: string;
  email: string;
  role: string;
  userId?: number;
  plan?: SubscriptionPlan;
}

export interface StoredFuelSettings {
  fuelPrice?: number;
  fuelEfficiencyKmPerLiter?: number;
}

export const sessionStorage = {
  async saveSession(token: string, email: string, role: string, userId?: number, plan?: SubscriptionPlan) {
    const pairs: [string, string][] = [
      [TOKEN_KEY, token],
      [EMAIL_KEY, email],
      [ROLE_KEY, role],
    ];
    if (userId !== undefined) {
      pairs.push([USER_ID_KEY, String(userId)]);
    }
    if (plan) {
      pairs.push([PLAN_KEY, JSON.stringify(plan)]);
    }
    await AsyncStorage.multiSet(pairs);
    if (userId === undefined) {
      await AsyncStorage.removeItem(USER_ID_KEY);
    }
    if (!plan) {
      await AsyncStorage.removeItem(PLAN_KEY);
    }
  },
  async clearSession() {
    await AsyncStorage.multiRemove([TOKEN_KEY, EMAIL_KEY, ROLE_KEY, USER_ID_KEY, PLAN_KEY]);
  },
  async getSession(): Promise<StoredSession | null> {
    const pairs = await AsyncStorage.multiGet([TOKEN_KEY, EMAIL_KEY, ROLE_KEY, USER_ID_KEY, PLAN_KEY]);
    const values = Object.fromEntries(pairs);
    const token = values[TOKEN_KEY];
    const email = values[EMAIL_KEY];
    const role = values[ROLE_KEY];
    const userIdRaw = values[USER_ID_KEY];
    const planRaw = values[PLAN_KEY];
    if (!token || !email || !role) {
      return null;
    }
    const parsedUserId = userIdRaw ? Number(userIdRaw) : undefined;
    const userId = Number.isInteger(parsedUserId) && parsedUserId > 0 ? parsedUserId : undefined;
    let plan: SubscriptionPlan | undefined;
    if (planRaw) {
      try {
        plan = JSON.parse(planRaw) as SubscriptionPlan;
      } catch {
        plan = undefined;
      }
    }
    return { token, email, role, userId, plan };
  },
};

export const fuelSettingsStorage = {
  async save(settings: StoredFuelSettings) {
    const pairs: [string, string][] = [];
    if (settings.fuelPrice !== undefined) {
      pairs.push([FUEL_PRICE_KEY, String(settings.fuelPrice)]);
    }
    if (settings.fuelEfficiencyKmPerLiter !== undefined) {
      pairs.push([FUEL_EFFICIENCY_KEY, String(settings.fuelEfficiencyKmPerLiter)]);
    }
    if (pairs.length > 0) {
      await AsyncStorage.multiSet(pairs);
    }
  },
  async get(): Promise<StoredFuelSettings> {
    const pairs = await AsyncStorage.multiGet([FUEL_PRICE_KEY, FUEL_EFFICIENCY_KEY]);
    const values = Object.fromEntries(pairs);
    const fuelPriceRaw = values[FUEL_PRICE_KEY];
    const fuelEfficiencyRaw = values[FUEL_EFFICIENCY_KEY];
    const fuelPrice = fuelPriceRaw ? Number(fuelPriceRaw) : undefined;
    const fuelEfficiencyKmPerLiter = fuelEfficiencyRaw ? Number(fuelEfficiencyRaw) : undefined;
    return {
      fuelPrice: Number.isFinite(fuelPrice) ? fuelPrice : undefined,
      fuelEfficiencyKmPerLiter: Number.isFinite(fuelEfficiencyKmPerLiter) ? fuelEfficiencyKmPerLiter : undefined,
    };
  },
};
