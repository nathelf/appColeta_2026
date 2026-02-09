// src/lib/auth.ts

export type AuthUser = {
  username: string;
  name: string;
  email?: string;
  perfil?: 'ADMINISTRADOR' | 'OPERADOR' | 'SUPERVISOR';
  admin?: boolean;
  roles?: string[];
  token?: string;
  termoAceito?: boolean;
};

// Usuários mock — agora incluem email (fallback opcional)
const MOCK_USERS: Record<
  string,
  { password: string; name: string; roles?: string[]; email?: string; perfil?: AuthUser['perfil'] }
> = {
  admin: { password: "admin123", name: "Administrador", roles: ["admin"], email: "admin@local.test", perfil: "ADMINISTRADOR" },
  coletor: { password: "coletor123", name: "Coletor", roles: ["collector"], email: "coletor@local.test", perfil: "OPERADOR" },
  // você pode adicionar mais aqui, por exemplo:
  // "natmagro": { password: "teste123", name: "Nathalia", roles: ["collector"], email: "natmagro11@gmail.com" },
};

// Keys usadas no localStorage
const STORAGE_KEY = "authUser";
const TERMO_KEY = "termoAceito";

/**
 * Helper: encontra um registro de usuário mock por username ou email
 */
function findUserRecord(identifier: string) {
  // busca por username exato
  if (MOCK_USERS[identifier]) {
    return { username: identifier, ...MOCK_USERS[identifier] };
  }

  // busca por email (case-insensitive)
  const lower = identifier.toLowerCase();
  for (const key of Object.keys(MOCK_USERS)) {
    const rec = MOCK_USERS[key];
    if (rec.email && rec.email.toLowerCase() === lower) {
      return { username: key, ...rec };
    }
  }

  return null;
}

/**
 * Validação de login usando MOCK_USERS (aceita username OU email)
 */
export async function validateLogin(
  usernameOrEmail: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");
  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

  if (useMock) {
    await new Promise((r) => setTimeout(r, 250));

    const rec = findUserRecord(usernameOrEmail);
    if (!rec) {
      return { success: false, message: "Usuário não encontrado" };
    }

    if (rec.password !== password) {
      return { success: false, message: "Senha inválida" };
    }

    const user: AuthUser = {
      username: rec.username,
      name: rec.name,
      email: rec.email,
      roles: rec.roles,
      perfil: rec.perfil,
      termoAceito: getTermoAceito(rec.username),
    };

    return { success: true, user };
  }

  try {
    const response = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: usernameOrEmail, senha: password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData?.error || "Usuário não encontrado",
      };
    }

    const data = await response.json();
    const apiUser = data?.usuario;
    const perfil =
      apiUser?.perfil ||
      (apiUser?.admin ? "ADMINISTRADOR" : "OPERADOR");

    const user: AuthUser = {
      username: apiUser?.email || usernameOrEmail,
      name: apiUser?.nome || usernameOrEmail,
      email: apiUser?.email || usernameOrEmail,
      admin: !!apiUser?.admin,
      perfil,
      token: data?.token,
      termoAceito: getTermoAceito(apiUser?.email || usernameOrEmail),
    };

    return { success: true, user };
  } catch {
    return { success: false, message: "Erro de conexão com o servidor" };
  }
}

/**
 * Salva usuário no localStorage
 */
export function setAuthUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

/**
 * Retorna usuário salvo ou null
 */
export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Limpa usuário do localStorage
 */
export function clearAuthUser() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Marca o aceite do termo.
 */
export function setTermoAceito(value: boolean, username?: string) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (username && raw) {
    try {
      const user = JSON.parse(raw) as AuthUser;
      if (user && user.username === username) {
        user.termoAceito = !!value;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        return;
      }
    } catch {}
  }
  try {
    localStorage.setItem(TERMO_KEY, value ? "true" : "false");
  } catch {}
}

/**
 * Retorna se o termo foi aceito.
 */
export function getTermoAceito(username?: string): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (username && raw) {
    try {
      const user = JSON.parse(raw) as AuthUser;
      if (user && user.username === username && typeof user.termoAceito === "boolean") {
        return user.termoAceito;
      }
    } catch {}
  }
  const termoRaw = localStorage.getItem(TERMO_KEY);
  return termoRaw === "true";
}
