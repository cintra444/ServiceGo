import type { LoginResponse } from "../types/api";

const SESSION_KEY = "servicego:web:session";
const FUEL_SETTINGS_KEY = "servicego:web:fuel-settings";

export interface StoredFuelSettings {
  fuelPrice?: number;
  fuelEfficiencyKmPerLiter?: number;
}

export function getStoredSession(): LoginResponse | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as LoginResponse) : null;
  } catch {
    return null;
  }
}

export function setStoredSession(session: LoginResponse) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearStoredSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function getFuelSettings(): StoredFuelSettings {
  try {
    const raw = window.localStorage.getItem(FUEL_SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as StoredFuelSettings) : {};
  } catch {
    return {};
  }
}

export function setFuelSettings(settings: StoredFuelSettings) {
  window.localStorage.setItem(FUEL_SETTINGS_KEY, JSON.stringify(settings));
}
