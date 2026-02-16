// ARQUIVO: src/lib/auth.ts

// Chaves para salvar no localStorage
const USER_KEY = "app_user";
const TOKEN_KEY = "app_token";

// --- TIPAGENS ---

export interface User {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  admin: boolean;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface ValidationErrors {
  email?: string;
  senha?: string;
}

// --- FUNÇÕES DE SESSÃO ---

export function setAuthUser(user: User, token?: string) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getAuthUser(): User | null {
  const json = localStorage.getItem(USER_KEY);
  if (!json) return null;
  try {
    const user = JSON.parse(json);
    if (user && user.perfil && user.perfil !== "ADMINISTRADOR" && user.perfil !== "COLETISTA") {
      user.perfil = "COLETISTA";
    }
    return user;
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function logout() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = "/login";
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// --- FUNÇÃO DE VALIDAÇÃO (Recriada) ---

export function validateLogin(data: LoginData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!data.email) {
    errors.email = "O e-mail é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Formato de e-mail inválido.";
  }

  if (!data.senha) {
    errors.senha = "A senha é obrigatória.";
  } else if (data.senha.length < 6) {
    errors.senha = "A senha deve ter pelo menos 6 caracteres.";
  }

  return errors;
}

// --- TERMO DE USO ---

const TERMO_KEY = "app_termo_aceito";

export function setTermoAceito(aceito: boolean) {
  localStorage.setItem(TERMO_KEY, aceito ? "true" : "false");
}

export function getTermoAceito(): boolean {
  return localStorage.getItem(TERMO_KEY) === "true";
}


// --- FUNÇÃO DE LOGIN (Conectada ao Backend) ---

export async function login(email: string, senha: string) {
  try {
    // Usa a mesma origem do frontend, passando pelo proxy /auth do Vite
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    const data = await response.json();

    if (!response.ok) {
      const detail = data.detail ? ` (${data.detail})` : "";
      throw new Error((data.error || "Erro ao fazer login") + detail);
    }

    // Salva sessão automaticamente (normaliza perfil: só ADMINISTRADOR ou COLETISTA)
    if (data.usuario && data.token) {
      const perfil = data.usuario.perfil === "ADMINISTRADOR" ? "ADMINISTRADOR" : "COLETISTA";
      setAuthUser({ ...data.usuario, perfil }, data.token);
    }

    return data;
  } catch (error: any) {
    console.error("Erro na requisição de login:", error);
    throw error;
  }
}