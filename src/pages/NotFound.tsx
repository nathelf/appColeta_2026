import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    // Não logar como erro rotas da API (/api/*) — são endpoints, não páginas
    if (location.pathname.startsWith("/api")) return;
    console.warn("404: Rota não encontrada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-gray-600">{t('notFound.title')}</p>
        <a href="/" className="text-blue-500 underline hover:text-blue-700">
          {t('notFound.backHome')}
        </a>
      </div>
    </div>
  );
};

export default NotFound;
