import { useLiveQuery } from 'dexie-react-hooks';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';
import { db } from '@/lib/db';
import { routes } from '@/lib/routes';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Pencil, KeyRound, Trash2, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTranslation } from 'react-i18next';
import { enqueueSyncItem } from '@/lib/sync';

export default function GerenciarUsuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const getProfileLabel = (perfil: string) => {
    const map: Record<string, string> = {
      ADMINISTRADOR: 'users.profiles.admin',
      COLETISTA: 'users.profiles.collector',
      OPERADOR: 'users.profiles.collector',
      SUPERVISOR: 'users.profiles.collector',
    };
    const key = map[perfil] || 'users.profiles.collector';
    return t(key);
  };

  const usuarios = useLiveQuery(() => {
    if (searchTerm) {
      return db.usuarios
        .filter(u => 
          u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .toArray();
    }
    return db.usuarios.toArray();
  }, [searchTerm]);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await db.usuarios.update(id, { ativo: !currentStatus, updatedAt: new Date() });
      const usuarioAtualizado = await db.usuarios.get(id);
      if (usuarioAtualizado) {
        await enqueueSyncItem({
          tipo: 'USUARIO',
          table: 'usuarios',
          data: usuarioAtualizado,
          prioridade: 1
        });
      }
      toast({
        title: t('usersManage.status.toastTitle'),
        description: t('usersManage.status.toastDescription', { status: !currentStatus ? t('users.status.active') : t('users.status.inactive') }),
      });
    } catch (error) {
      toast({
        title: t('usersManage.errors.statusTitle'),
        description: t('usersManage.errors.statusDescription'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;

    try {
      await db.usuarios.delete(deleteUserId);
      toast({
        title: t('usersManage.delete.toastTitle'),
        description: t('usersManage.delete.toastDescription'),
      });
      setDeleteUserId(null);
    } catch (error) {
      toast({
        title: t('usersManage.errors.deleteTitle'),
        description: t('usersManage.errors.deleteDescription'),
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title={t('usersManage.title')}
        description={t('usersManage.description')}
        actions={
          <Button onClick={() => navigate(routes.usuarios.novo)}>
            {t('users.new')}
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Input
              placeholder={t('usersManage.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {usuarios?.map((usuario) => (
              <Card key={usuario.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{usuario.nome}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${usuario.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {usuario.ativo ? t('users.status.active') : t('users.status.inactive')}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        {getProfileLabel(usuario.perfil)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{usuario.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => navigate(routes.usuarios.editar(usuario.id!.toString()))}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleStatus(usuario.id!, usuario.ativo)}
                    >
                      {usuario.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteUserId(usuario.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {usuarios?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {t('users.empty')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('usersManage.delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('usersManage.delete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('users.actions.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
