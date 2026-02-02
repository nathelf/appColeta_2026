import { Navigate } from 'react-router-dom';
import { getAuthUser, getTermoAceito } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const user = getAuthUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const termoAceito = getTermoAceito();
  if (!termoAceito) {
    return <Navigate to="/termo-de-uso" replace />;
  }

  if (requireAdmin && user.perfil !== 'ADMINISTRADOR') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
