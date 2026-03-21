const REQUEST_TIMEOUT_MS = 12000;

export const API_BASE_URL = (import.meta.env.VITE_API_URL?.trim() || "http://localhost:8080").replace(/\/$/, "");

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

interface RequestOptions {
  method?: HttpMethod;
  token?: string | null;
  body?: unknown;
}

function buildHeaders(token?: string | null) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function parsePayload(response: Response) {
  const raw = await response.text();
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function extractApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const maybeMessage = "message" in payload ? payload.message : null;
  if (typeof maybeMessage === "string" && maybeMessage) {
    return maybeMessage;
  }

  const maybeError = "error" in payload ? payload.error : null;
  if (typeof maybeError === "string" && maybeError) {
    return maybeError;
  }

  return null;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body } = options;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: buildHeaders(token),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = await parsePayload(response);

    if (!response.ok) {
      const message = extractApiMessage(payload) ?? `Erro HTTP ${response.status}`;
      throw new ApiError(message, response.status);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Tempo de conexão excedido. Verifique a URL da API.", 0);
    }
    throw new ApiError("Falha de conexão com a API.", 0);
  } finally {
    window.clearTimeout(timeoutId);
  }
}
