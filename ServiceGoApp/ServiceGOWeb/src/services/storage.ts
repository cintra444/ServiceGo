import type { LoginResponse } from "../types/api";

const SESSION_KEY = "servicego:web:session";

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
