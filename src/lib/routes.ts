export const routes = {
  login: "/login",
  termo: "/termo-de-uso",
  dashboard: "/dashboard",

  coleta: {
    primeira: "/coleta/primeira",
    recoleta: "/coleta/recoleta",
    sessao: (id: string) => `/coleta/sessao/${id}`,
    captura: (id: string) => `/coleta/sessao/${id}/captura`,
    capturaPincas: (id: string) => `/coleta/sessao/${id}/captura-pincas`,
    formulario: (id: string) => `/coleta/sessao/${id}/formulario`,
    conclusao: (id: string) => `/coleta/sessao/${id}/conclusao`,
  },

  sessoes: "/sessoes",

  usuarios: {
    root: "/usuarios",
    novo: "/usuarios/novo",
    editar: (id: string) => `/usuarios/${id}`,
  },

  relatorios: "/relatorios",
  auditoria: "/auditoria",
  loginEventos: "/login-eventos",
  sincronizacao: "/sincronizacao",
  configuracoes: "/configuracoes",
} as const;
