import { routes } from "./routes";

export type Crumb = { label: string; href?: string };

export function getBreadcrumbs(pathname: string): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Início", href: routes.dashboard }];

  const clean = pathname.replace(/\/+$/, "");

  const staticMap: Record<string, Crumb[]> = {
    [routes.dashboard]: [{ label: "Dashboard" }],
    [routes.coleta.primeira]: [{ label: "Coleta" }, { label: "Primeira Coleta" }],
    [routes.coleta.recoleta]: [{ label: "Coleta" }, { label: "Recoleta" }],
    [routes.sessoes]: [{ label: "Sessões" }],
    [routes.usuarios.root]: [{ label: "Usuários" }],
    [routes.usuarios.novo]: [{ label: "Usuários", href: routes.usuarios.root }, { label: "Novo" }],
    [routes.relatorios]: [{ label: "Relatórios" }],
    [routes.auditoria]: [{ label: "Auditoria" }],
    [routes.loginEventos]: [{ label: "Eventos de Login" }],
    [routes.sincronizacao]: [{ label: "Sincronização" }],
    [routes.configuracoes]: [{ label: "Configurações" }]
  };

  if (staticMap[clean]) return [...crumbs, ...staticMap[clean]];

  const sessaoMatch = clean.match(/^\/coleta\/sessao\/([^\/]+)(?:\/(captura|formulario|conclusao))?$/);
  if (sessaoMatch) {
    const id = sessaoMatch[1];
    const etapa = sessaoMatch[2];
    crumbs.push({ label: "Coleta" });
    crumbs.push({ label: `Sessão ${id.substring(0, 8)}`, href: routes.coleta.conclusao(id) });
    if (etapa === "captura") crumbs.push({ label: "Captura" });
    if (etapa === "formulario") crumbs.push({ label: "Formulário" });
    if (etapa === "conclusao") crumbs.push({ label: "Conclusão" });
    return crumbs;
  }

  const userEdit = clean.match(/^\/usuarios\/([^\/]+)$/);
  if (userEdit && userEdit[1] !== 'novo') {
    const id = userEdit[1];
    crumbs.push({ label: "Usuários", href: routes.usuarios.root });
    crumbs.push({ label: `Editar ${id.substring(0, 8)}` });
    return crumbs;
  }

  const segments = clean.split("/").filter(Boolean);
  let href = "";
  for (const s of segments) {
    href += `/${s}`;
    crumbs.push({ label: s.charAt(0).toUpperCase() + s.slice(1), href });
  }
  return crumbs;
}
