import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus, Users, KeyRound, ArrowLeft } from 'lucide-react';
import { AlterarSenhaDialog } from '@/components/AlterarSenhaDialog';
import CadastrarUsuarioModal from '@/components/CadastrarUsuarioModal';
import GerenciarUsuariosModal from '@/components/GerenciarUsuariosModal';
import { useTranslation } from 'react-i18next';
import { getAuthUser } from '@/lib/auth';

export default function ConfiguracoesUsuario() {
  const navigate = useNavigate();
  const [senhaDialogOpen, setSenhaDialogOpen] = useState(false);
  const [cadastrarUsuarioOpen, setCadastrarUsuarioOpen] = useState(false);
  const [gerenciarUsuariosOpen, setGerenciarUsuariosOpen] = useState(false);
  const isAdmin = getAuthUser()?.perfil === 'ADMINISTRADOR';
  const { t } = useTranslation();

  return (
    <AppLayout>
      <Breadcrumb items={[
        { label: t('menu.collection'), href: '/coleta/primeira' },
        { label: t('settings.title') }
      ]} />
      
      <PageHeader
        title={t('userSettings.title')}
        description={isAdmin ? t('userSettings.adminDescription') : t('userSettings.userDescription')}
      />

      <div className="max-w-2xl space-y-4">
        {isAdmin && (
          <>
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setCadastrarUsuarioOpen(true)}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <UserPlus className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold">{t('userSettings.createUserTitle')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('userSettings.createUserDescription')}
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setGerenciarUsuariosOpen(true)}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold">{t('userSettings.manageUsersTitle')}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('userSettings.manageUsersDescription')}
                </p>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSenhaDialogOpen(true)}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <KeyRound className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">{t('userSettings.changePasswordTitle')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('userSettings.changePasswordDescription')}
            </p>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          onClick={() => navigate('/coleta/primeira')}
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('userSettings.backToMenu')}
        </Button>
      </div>

      <AlterarSenhaDialog 
        open={senhaDialogOpen} 
        onOpenChange={setSenhaDialogOpen}
      />

      {/* Modal Cadastrar Usuário */}
      <Dialog open={cadastrarUsuarioOpen} onOpenChange={setCadastrarUsuarioOpen}>
        <DialogContent className="bg-card max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('userSettings.createUserDialogTitle')}</DialogTitle>
          </DialogHeader>
          <CadastrarUsuarioModal onClose={() => setCadastrarUsuarioOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Modal Gerenciar Usuários */}
      <Dialog open={gerenciarUsuariosOpen} onOpenChange={setGerenciarUsuariosOpen}>
        <DialogContent className="bg-card max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>{t('userSettings.manageUsersDialogTitle')}</DialogTitle>
          </DialogHeader>
          <div className="px-6 pb-6">
            <GerenciarUsuariosModal onClose={() => setGerenciarUsuariosOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
