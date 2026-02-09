import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Fingerprint, 
  LayoutDashboard, 
  RefreshCw, 
  Users,
  Clock,
  Settings,
  Menu,
  LogOut
} from 'lucide-react';

import { ConnectivityIndicator } from './ConnectivityIndicator';
import { SyncStatus } from './SyncStatus';
import { Button } from './ui/button';
import { NavLink } from './NavLink';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from './ui/sidebar';

import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import logo from '@/assets/biometria-logo.png';
import { getAuthUser } from '@/lib/auth';

interface AppLayoutProps {
  children: ReactNode;
}

//
// ✅ Helper para evitar duplicação
//
function useIsAdmin() {
  const user = getAuthUser();
  return user?.perfil === 'ADMINISTRADOR';
}

//
// ================= SIDEBAR =================
//
function AppSidebar() {
  const { state } = useSidebar();
  const { t } = useTranslation();
  const isAdmin = useIsAdmin();

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    window.location.href = '/login';
  };

  const menuItems = [
    { 
      group: t('menu.home'),
      items: [
        { title: t('menu.dashboard'), url: '/dashboard', icon: LayoutDashboard }
      ]
    },
    {
      group: t('menu.collection'),
      items: [
        { title: t('menu.firstCollection'), url: '/coleta/primeira', icon: Fingerprint },
        { title: t('menu.recollection'), url: '/coleta/recoleta', icon: RefreshCw }
      ]
    },
    ...(isAdmin
      ? [{
          group: t('menu.administrative'),
          items: [
            { title: t('menu.users'), url: '/usuarios', icon: Users }
          ]
        }]
      : []),
    {
      group: t('menu.system'),
      items: [
        { title: t('menu.sync'), url: '/sincronizacao', icon: Clock },
        ...(isAdmin ? [{ title: t('menu.settings'), url: '/configuracoes', icon: Settings }] : [])
      ]
    }
  ];

  return (
    <Sidebar className={state === "collapsed" ? "w-14" : "w-60"}>
      <div className="border-b p-4 flex items-center gap-3">
        <img src={logo} alt={t('app.logoAlt')} className="w-10 h-10 rounded-md object-contain" />
        {state !== "collapsed" && (
          <div>
            <h2 className="font-bold text-sm">{t('app.title')}</h2>
            <p className="text-xs text-muted-foreground">{t('app.subtitle')}</p>
          </div>
        )}
      </div>

      <SidebarContent>
        {menuItems.map((group) => (
          <SidebarGroup key={group.group}>
            {state !== "collapsed" && (
              <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            )}

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="hover:bg-muted/50 flex items-center gap-3 px-3 py-2 rounded-lg"
                        activeClassName="bg-muted text-primary font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {state !== "collapsed" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Logout */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="hover:bg-destructive/10 text-destructive flex items-center gap-3 px-3 py-2 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  {state !== "collapsed" && <span>{t('menu.logout')}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

//
// ================= MOBILE NAV =================
//
function MobileBottomNav() {
  const location = useLocation();
  const { t } = useTranslation();
  const isAdmin = useIsAdmin();

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    window.location.href = '/login';
  };

  const navItems = [
    { title: t('menu.dashboard'), url: '/dashboard', icon: LayoutDashboard },
    { title: t('menu.collection'), url: '/coleta/primeira', icon: Fingerprint },
    { title: t('menu.sync'), url: '/sincronizacao', icon: Clock },
    ...(isAdmin ? [{ title: t('menu.config'), url: '/configuracoes', icon: Settings }] : [])
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-card z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.url ||
            (item.url === '/coleta/primeira' &&
              location.pathname.startsWith('/coleta'));

          return (
            <Link
              key={item.url}
              to={item.url}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.title}</span>
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs">{t('menu.logout')}</span>
        </button>
      </div>
    </nav>
  );
}

//
// ================= LAYOUT =================
//
export function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation();
  const isAdmin = useIsAdmin(); // ✅ agora existe aqui também

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-secondary">

        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col w-full">

          {/* Topbar */}
          <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 shadow-soft">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">

              <div className="flex items-center gap-3">
                <SidebarTrigger className="hidden md:flex" />

                {/* Mobile Sheet */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>

                  <SheetContent side="left" className="w-60 p-0">

                    {/* Logo */}
                    <div className="border-b p-4 flex items-center gap-3">
                      <img src={logo} className="w-10 h-10 rounded-md" />
                      <div>
                        <h2 className="font-bold text-sm">{t('app.title')}</h2>
                        <p className="text-xs text-muted-foreground">
                          {t('app.subtitle')}
                        </p>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="p-4 flex flex-col h-full">
                      <nav className="space-y-6 flex-1">

                        {[
                          {
                            group: t('menu.home'),
                            items: [
                              {
                                title: t('menu.dashboard'),
                                url: '/dashboard',
                                icon: LayoutDashboard
                              }
                            ]
                          },
                          {
                            group: t('menu.collection'),
                            items: [
                              {
                                title: t('menu.firstCollection'),
                                url: '/coleta/primeira',
                                icon: Fingerprint
                              },
                              {
                                title: t('menu.recollection'),
                                url: '/coleta/recoleta',
                                icon: RefreshCw
                              }
                            ]
                          },

                          ...(isAdmin
                            ? [{
                                group: t('menu.administrative'),
                                items: [
                                  {
                                    title: t('menu.users'),
                                    url: '/usuarios',
                                    icon: Users
                                  }
                                ]
                              }]
                            : []),

                          {
                            group: t('menu.system'),
                            items: [
                              {
                                title: t('menu.sync'),
                                url: '/sincronizacao',
                                icon: Clock
                              },
                              ...(isAdmin
                                ? [{
                                    title: t('menu.settings'),
                                    url: '/configuracoes',
                                    icon: Settings
                                  }]
                                : [])
                            ]
                          }

                        ].map((group) => (
                          <div key={group.group}>
                            <h3 className="text-sm font-semibold mb-2 text-muted-foreground">
                              {group.group}
                            </h3>

                            <div className="space-y-1">
                              {group.items.map((item) => (
                                <NavLink
                                  key={item.url}
                                  to={item.url}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50"
                                  activeClassName="bg-muted text-primary font-medium"
                                >
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.title}</span>
                                </NavLink>
                              ))}
                            </div>
                          </div>
                        ))}

                      </nav>

                      {/* Logout */}
                      <Button
                        variant="outline"
                        className="w-full mt-4 text-destructive"
                        onClick={() => {
                          localStorage.removeItem('authUser');
                          window.location.href = '/login';
                        }}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('menu.logout')}
                      </Button>
                    </div>

                  </SheetContent>
                </Sheet>
              </div>

              <div className="flex items-center gap-3">
                <SyncStatus />
                <ConnectivityIndicator />
              </div>

            </div>
          </header>

          {/* Content */}
          <main className="flex-1 container mx-auto px-4 py-6 pb-20 md:pb-6">
            {children}
          </main>

        </div>

        <MobileBottomNav />
      </div>
    </SidebarProvider>
  );
}
