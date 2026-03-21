import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: React.PropsWithChildren) {
  const { isReady, session } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <div className="page-state">Carregando sessão...</div>;
  }

  if (!session?.token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
