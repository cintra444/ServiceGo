import { NativeModules, Platform } from "react-native";

const REQUEST_TIMEOUT_MS = 12000;

const resolveApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) {
    return envUrl;
  }

  const devServerOrigin = process.env.EXPO_DEV_SERVER_ORIGIN?.trim();
  if (devServerOrigin) {
    try {
      const host = new URL(devServerOrigin).hostname;
      if (host) {
        return `http://${host}:8080`;
      }
    } catch {
      // Falls through to other resolvers when URL parsing fails.
    }
  }

  const packagerHost = process.env.REACT_NATIVE_PACKAGER_HOSTNAME?.trim();
  if (packagerHost) {
    return `http://${packagerHost}:8080`;
  }

  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  if (scriptURL) {
    try {
      const host = new URL(scriptURL).hostname;
      if (host) {
        return `http://${host}:8080`;
      }
    } catch {
      // Falls through to platform defaults when URL parsing fails.
    }
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8080";
  }

  return "http://localhost:8080";
};

const API_BASE_URL = resolveApiBaseUrl();
console.log("[ServiceGO][API] Base URL:", API_BASE_URL);
console.log("[ServiceGO][API] Env hints:", {
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? null,
  EXPO_DEV_SERVER_ORIGIN: process.env.EXPO_DEV_SERVER_ORIGIN ?? null,
  REACT_NATIVE_PACKAGER_HOSTNAME: process.env.REACT_NATIVE_PACKAGER_HOSTNAME ?? null,
});

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

const buildHeaders = (token?: string | null) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body } = options;
  const url = `${API_BASE_URL}${path}`;
  console.log("[ServiceGO][API] Request:", { method, url, hasToken: Boolean(token), hasBody: body !== undefined });
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: buildHeaders(token),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
    console.log("[ServiceGO][API] Response:", { method, url, status: response.status });
  } catch (error) {
    console.error("[ServiceGO][API] Fetch error:", { method, url, error });
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Tempo de conexão excedido. Verifique a URL da API e a rede.", 0);
    }
    throw new ApiError("Falha de conexão com a API. Verifique se backend e celular estão na mesma rede.", 0);
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const rawText = await response.text();
  const payload = rawText ? JSON.parse(rawText) : null;

  if (!response.ok) {
    console.error("[ServiceGO][API] HTTP error payload:", { method, url, status: response.status, payload });
    const message =
      (payload && typeof payload.message === "string" && payload.message) ||
      (payload && typeof payload.error === "string" && payload.error) ||
      `Erro HTTP ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
