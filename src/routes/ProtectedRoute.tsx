import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getAuthUser } from "@/lib/auth";
import { hasPermission } from "./permissions";

interface Props {
  children: ReactNode;
  requireAdmin?: boolean;
}

/**
 * Middleware global de rotas
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
}: Props) {
  const location = useLocation();
  const user = getAuthUser();

  // ❌ Não logado
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // 🔐 Só admin
  if (
    requireAdmin &&
    user.perfil !== "ADMINISTRADOR"
  ) {
    if (user.perfil === "COLETISTA") {
      return (
        <Navigate
          to="/dashboard-coletista"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  // 🔐 Permissão por rota
  const allowed = hasPermission(
    user,
    location.pathname
  );

  if (!allowed) {
    if (user.perfil === "COLETISTA") {
      return (
        <Navigate
          to="/dashboard-coletista"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return <>{children}</>;
}
