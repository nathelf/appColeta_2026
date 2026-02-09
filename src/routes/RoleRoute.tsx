import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthUser } from "@/lib/auth";
import { hasRoutePermission } from "./permissions";

interface Props {
  children: ReactNode;
}

/**
 * Middleware de permissão por rota
 */
export function RoleRoute({ children }: Props) {
  const location = useLocation();
  const user = getAuthUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = hasRoutePermission(
    user,
    location.pathname
  );

  if (!allowed) {
    // Redireciona operador para dashboard limitado
    if (user.perfil === "OPERADOR") {
      return (
        <Navigate
          to="/dashboard-operador"
          replace
        />
      );
    }

    // Outros → dashboard normal
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <>{children}</>;
}
