import { AuthUser } from "@/lib/auth";

export type UserPerfil =
  | "ADMINISTRADOR"
  | "OPERADOR"
  | "SUPERVISOR";

/**
 * Permissões por rota
 */
export const ROUTE_PERMISSIONS: Record<
  string,
  UserPerfil[]
> = {
  "/dashboard": ["ADMINISTRADOR", "OPERADOR", "SUPERVISOR"],

  "/usuarios": ["ADMINISTRADOR"],
  "/usuarios/novo": ["ADMINISTRADOR"],
  "/usuarios/": ["ADMINISTRADOR"],

  "/auditoria": ["ADMINISTRADOR"],
  "/login-eventos": ["ADMINISTRADOR"],

  "/sincronizacao": ["ADMINISTRADOR", "SUPERVISOR"],

  "/configuracoes": ["ADMINISTRADOR"],
};

/**
 * Verifica permissão
 */
export function hasPermission(
  user: AuthUser | null,
  path: string
): boolean {
  if (!user) return false;

  const match = Object.keys(
    ROUTE_PERMISSIONS
  ).find((route) =>
    path.startsWith(route)
  );

  if (!match) return true;

  const allowed =
    ROUTE_PERMISSIONS[match];

  return allowed.includes(
    user.perfil || "OPERADOR"
  );
}
