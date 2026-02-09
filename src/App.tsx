import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useEffect } from "react";
import { ThemeProvider } from "next-themes";

import Login from "./pages/Login";
import TermoDeUso from "./pages/TermoDeUso";
import MenuColeta from "./pages/MenuColeta";
import PrimeiraColeta from "./pages/PrimeiraColeta";
import CadastroBebe from "./pages/CadastroBebe";
import Recoleta from "./pages/Recoleta";
import Captura from "./pages/Captura";
import CapturaPincas from "./pages/CapturaPincas";
import Formulario from "./pages/Formulario";
import Conclusao from "./pages/Conclusao";
import Sessoes from "./pages/Sessoes";
import Usuarios from "./pages/Usuarios";
import UsuariosNovo from "./pages/UsuariosNovo";
import UsuariosEditar from "./pages/UsuariosEditar";
import Relatorios from "./pages/Relatorios";
import Sincronizacao from "./pages/Sincronizacao";
import Auditoria from "./pages/Auditoria";
import LoginEventos from "./pages/LoginEventos";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import DashboardOperador from "./pages/DashboardOperador";

import { seedDatabase } from "./lib/seedData";
import { ProtectedRoute } from "./routes/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        storageKey="app-theme"
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <Routes>

              {/* Root */}
              <Route
                path="/"
                element={<Navigate to="/login" replace />}
              />

              {/* Public */}
              <Route path="/login" element={<Login />} />
              <Route
                path="/termo-de-uso"
                element={<TermoDeUso />}
              />

              {/* Dashboard operador */}
              <Route
                path="/dashboard-operador"
                element={
                  <ProtectedRoute>
                    <DashboardOperador />
                  </ProtectedRoute>
                }
              />

              {/* Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MenuColeta />
                  </ProtectedRoute>
                }
              />

              {/* Coleta */}
              <Route
                path="/coleta/primeira"
                element={
                  <ProtectedRoute>
                    <PrimeiraColeta />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/coleta/cadastro-bebe"
                element={
                  <ProtectedRoute>
                    <CadastroBebe />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/coleta/recoleta"
                element={
                  <ProtectedRoute>
                    <Recoleta />
                  </ProtectedRoute>
                }
              />

              {/* 🔥 ROTAS DINÂMICAS QUE FALTAVAM */}
              <Route
                path="/coleta/sessao/:id/captura"
                element={
                  <ProtectedRoute>
                    <Captura />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/coleta/sessao/:id/captura-pincas"
                element={
                  <ProtectedRoute>
                    <CapturaPincas />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/coleta/sessao/:id/formulario"
                element={
                  <ProtectedRoute>
                    <Formulario />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/coleta/sessao/:id/conclusao"
                element={
                  <ProtectedRoute>
                    <Conclusao />
                  </ProtectedRoute>
                }
              />

              {/* Sessões */}
              <Route
                path="/sessoes"
                element={
                  <ProtectedRoute>
                    <Sessoes />
                  </ProtectedRoute>
                }
              />

              {/* Admin */}
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute requireAdmin>
                    <Usuarios />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/usuarios/novo"
                element={
                  <ProtectedRoute requireAdmin>
                    <UsuariosNovo />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/usuarios/:id"
                element={
                  <ProtectedRoute requireAdmin>
                    <UsuariosEditar />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/auditoria"
                element={
                  <ProtectedRoute requireAdmin>
                    <Auditoria />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/login-eventos"
                element={
                  <ProtectedRoute requireAdmin>
                    <LoginEventos />
                  </ProtectedRoute>
                }
              />

              {/* Outros */}
              <Route
                path="/relatorios"
                element={
                  <ProtectedRoute>
                    <Relatorios />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/sincronizacao"
                element={
                  <ProtectedRoute>
                    <Sincronizacao />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/configuracoes"
                element={
                  <ProtectedRoute>
                    <Configuracoes />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route
                path="*"
                element={<NotFound />}
              />

            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
