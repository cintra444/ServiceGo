import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/api";
import { clearStoredSession, getStoredSession, setStoredSession } from "../services/storage";
import type { LoginResponse } from "../types/api";

interface AuthContextValue {
  isReady: boolean;
  session: LoginResponse | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePlan: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [session, setSession] = useState<LoginResponse | null>(null);

  useEffect(() => {
    setSession(getStoredSession());
    setIsReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const nextSession = await authApi.login({ email, password });
    setSession(nextSession);
    setStoredSession(nextSession);
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    clearStoredSession();
  }, []);

  const updatePlan = useCallback(async () => {
    if (!session?.token) {
      return;
    }
    const plan = await authApi.mePlan(session.token);
    const nextSession = { ...session, plan };
    setSession(nextSession);
    setStoredSession(nextSession);
  }, [session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      session,
      login,
      logout,
      updatePlan,
    }),
    [isReady, session, login, logout, updatePlan],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
