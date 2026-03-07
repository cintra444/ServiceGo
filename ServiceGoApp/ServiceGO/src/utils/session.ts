import { agendamentosApi, veiculosApi } from "../services/api";

const base64UrlDecode = (input: string) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  try {
    if (typeof globalThis.atob === "function") {
      return globalThis.atob(padded);
    }
    return "";
  } catch {
    return "";
  }
};

const parseTokenPayload = (token: string): Record<string, unknown> | null => {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }
  const decoded = base64UrlDecode(parts[1]);
  if (!decoded) {
    return null;
  }
  try {
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const getTokenPayload = (token: string) => parseTokenPayload(token);

const parsePositiveInt = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
};

export const extractUserIdFromToken = (token: string): number | undefined => {
  const payload = getTokenPayload(token);
  if (!payload) {
    return undefined;
  }

  return (
    parsePositiveInt(payload.userId) ??
    parsePositiveInt(payload.usuarioId) ??
    parsePositiveInt(payload.uid) ??
    parsePositiveInt(payload.id) ??
    parsePositiveInt(payload.sub)
  );
};

export const isTokenExpired = (token: string, skewSeconds = 30): boolean => {
  const payload = getTokenPayload(token);
  if (!payload) {
    return true;
  }
  const exp = typeof payload.exp === "number" ? payload.exp : Number(payload.exp);
  if (!Number.isFinite(exp) || exp <= 0) {
    return true;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  return nowSeconds >= exp - skewSeconds;
};

export const resolveUserId = async (token: string): Promise<number | undefined> => {
  const fromToken = extractUserIdFromToken(token);
  if (fromToken) {
    return fromToken;
  }

  try {
    const veiculos = await veiculosApi.list(token);
    const ids = Array.from(new Set(veiculos.map((v) => Number(v.donoUsuarioId)).filter((id) => Number.isInteger(id) && id > 0)));
    if (ids.length === 1) {
      return ids[0];
    }
  } catch {
    // Ignore fallback errors and keep trying.
  }

  try {
    const agendamentos = await agendamentosApi.list(token);
    const ids = Array.from(
      new Set(agendamentos.map((item) => Number(item.usuarioId)).filter((id) => Number.isInteger(id) && id > 0)),
    );
    if (ids.length === 1) {
      return ids[0];
    }
  } catch {
    // Ignore fallback errors.
  }

  return undefined;
};
