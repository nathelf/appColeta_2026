import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";

import { AppLayout } from "@/components/AppLayout";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import DashboardColetista from "@/pages/DashboardColetista";
import Usuarios from "@/pages/usuarios";
import PrimeiraColeta from "@/pages/coleta-primeira";
import Recoleta from "@/pages/coleta-recoleta";
import Sincronizacao from "@/pages/sincronizacao";
import Configuracoes from "@/pages/configuracoes";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Rotas protegidas */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <RoleRoute>
                <Dashboard />
              </RoleRoute>
            }
          />

          <Route
            path="/dashboard-coletista"
            element={
              <RoleRoute>
                <DashboardColetista />
              </RoleRoute>
            }
          />

          <Route
            path="/usuarios"
            element={
              <RoleRoute>
                <Usuarios />
              </RoleRoute>
            }
          />

          <Route
            path="/coleta/primeira"
            element={
              <RoleRoute>
                <PrimeiraColeta />
              </RoleRoute>
            }
          />

          <Route
            path="/coleta/recoleta"
            element={
              <RoleRoute>
                <Recoleta />
              </RoleRoute>
            }
          />

          <Route
            path="/sincronizacao"
            element={
              <RoleRoute>
                <Sincronizacao />
              </RoleRoute>
            }
          />

          <Route
            path="/configuracoes"
            element={
              <RoleRoute>
                <Configuracoes />
              </RoleRoute>
            }
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
