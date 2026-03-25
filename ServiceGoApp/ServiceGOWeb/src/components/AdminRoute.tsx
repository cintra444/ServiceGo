import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function AdminRoute({ children }: React.PropsWithChildren) {
  const { session } = useAuth();
  const isAdmin = session?.role === "ROLE_ADMINISTRADOR" || session?.role === "ADMINISTRADOR";

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
