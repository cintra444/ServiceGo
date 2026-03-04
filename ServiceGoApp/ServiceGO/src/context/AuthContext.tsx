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
      const restored = await sessionStorage.getSession();
      if (mounted) {
        setSession(restored);
        setIsReady(true);
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
        const result = await authApi.login({ email, password });
        const nextSession = { token: result.token, email: result.email, role: result.role };
        setSession(nextSession);
        await sessionStorage.saveSession(nextSession.token, nextSession.email, nextSession.role);
      },
      logout: async () => {
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
