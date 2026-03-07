import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api";
import { sessionStorage, type StoredSession } from "../services/storage";

type SessionData = StoredSession;

interface AuthContextValue {
  isReady: boolean;
  session: SessionData | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      console.log("[ServiceGO][Auth] Bootstrap started");
      try {
        const restored = await sessionStorage.getSession();
        console.log("[ServiceGO][Auth] Bootstrap restored session:", {
          hasSession: Boolean(restored?.token),
          email: restored?.email ?? null,
          role: restored?.role ?? null,
        });
        if (mounted) {
          setSession(restored);
        }
      } catch (error) {
        console.error("[ServiceGO][Auth] Bootstrap error:", error);
        if (mounted) {
          setSession(null);
        }
      } finally {
        console.log("[ServiceGO][Auth] Bootstrap finished");
        if (mounted) {
          setIsReady(true);
        }
      }
    };
    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      session,
      login: async (email, password) => {
        console.log("[ServiceGO][Auth] Login started:", { email });
        const result = await authApi.login({ email, password });
        console.log("[ServiceGO][Auth] Login success:", { email: result.email, role: result.role });
        const nextSession = { token: result.token, email: result.email, role: result.role };
        setSession(nextSession);
        await sessionStorage.saveSession(nextSession.token, nextSession.email, nextSession.role);
        console.log("[ServiceGO][Auth] Session persisted");
      },
      logout: async () => {
        console.log("[ServiceGO][Auth] Logout");
        setSession(null);
        await sessionStorage.clearSession();
      },
    }),
    [isReady, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro do AuthProvider");
  }
  return ctx;
};
