import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthUser } from "@/lib/auth";
import { hasPermission } from "./permissions";

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

  const allowed = hasPermission(
    user,
    location.pathname
  );

  if (!allowed) {
    // Redireciona coletista para dashboard limitado
    if (user.perfil === "COLETISTA") {
      return (
        <Navigate
          to="/dashboard-coletista"
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
