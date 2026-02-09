import { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { formatCPF } from '@/lib/cpf';
import { formatDateTime } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserPlus, Search, Edit, Trash2, KeyRound, Power, PowerOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { enqueueSyncItem } from '@/lib/sync';
import { useSync } from '@/hooks/useSync';

export default function Usuarios() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getAuthUser();
  const { t } = useTranslation();
  const { pullDataFromServer } = useSync();
  const [syncing, setSyncing] = useState(false);

  // Sincronizar usuários quando a página carrega
  useEffect(() => {
    const syncUsuarios = async () => {
      setSyncing(true);
      try {
        await pullDataFromServer();
      } catch (error) {
        console.error('Erro ao sincronizar usuários:', error);
      } finally {
        setSyncing(false);
      }
    };

    syncUsuarios();
  }, [pullDataFromServer]);

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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState<string>('TODOS');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [usuarioParaRedefinir, setUsuarioParaRedefinir] = useState<{ id: number; nome: string } | null>(null);
  const [senhaTemporaria, setSenhaTemporaria] = useState('');
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState<{ id: number; nome: string } | null>(null);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState(false);

  const usuarios = useLiveQuery(() => db.usuarios.toArray());

  // Filtrar usuários - apenas ADMINISTRADOR e COLETISTA
  const filteredUsuarios = useMemo(() => {
    if (!usuarios) return [];

    let filtrados = usuarios;

    // Filtrar apenas ADMINISTRADOR e COLETISTA
    filtrados = filtrados.filter(u => 
      u.perfil === 'ADMINISTRADOR' || u.perfil === 'COLETISTA'
    );

    // Busca por nome, login (email) ou CPF
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      filtrados = filtrados.filter(u => 
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        (u.cpf && formatCPF(u.cpf).includes(termo))
      );
    }

    // Filtro por perfil
    if (filtroPerfil !== 'TODOS') {
      filtrados = filtrados.filter(u => u.perfil === filtroPerfil);
    }

    // Filtro por status
    if (filtroStatus !== 'TODOS') {
      const ativo = filtroStatus === 'ATIVO';
      filtrados = filtrados.filter(u => u.ativo === ativo);
    }

    return filtrados;
  }, [usuarios, searchTerm, filtroPerfil, filtroStatus]);

  // Contar administradores ativos
  const contarAdministradoresAtivos = () => {
    return usuarios?.filter(u => u.perfil === 'ADMINISTRADOR' && u.ativo).length || 0;
  };

  // Verificar se é o último administrador
  const isUltimoAdmin = (usuarioId: number) => {
    const usuario = usuarios?.find(u => u.id === usuarioId);
    if (!usuario || usuario.perfil !== 'ADMINISTRADOR' || !usuario.ativo) {
      return false;
    }
    return contarAdministradoresAtivos() === 1;
  };

  // Gerar senha temporária
  const gerarSenhaTemporaria = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let senha = '';
    for (let i = 0; i < 8; i++) {
      senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return senha;
  };

  // Redefinir senha
  const handleRedefinirSenha = async (usuarioId: number) => {
    const usuario = usuarios?.find(u => u.id === usuarioId);
    if (!usuario) {
      toast({
        variant: "destructive",
        title: t('users.errors.title'),
        description: t('users.errors.notFound')
      });
      return;
    }

    const senhaTemp = gerarSenhaTemporaria();
    setSenhaTemporaria(senhaTemp);
    setUsuarioParaRedefinir({ id: usuarioId, nome: usuario.nome });
    
    // TODO: Salvar senha temporária no banco de dados
    // Por enquanto, apenas exibimos no modal
  };

  const confirmarRedefinicaoSenha = () => {
    toast({
      title: t('users.resetPassword.toastTitle'),
      description: t('users.resetPassword.toastDescription', { name: usuarioParaRedefinir?.nome }),
    });
    setUsuarioParaRedefinir(null);
    setSenhaTemporaria('');
  };

  // Ativar/Inativar usuário
  const handleToggleStatus = async (usuarioId: number) => {
    const usuario = usuarios?.find(u => u.id === usuarioId);
    if (!usuario) {
      toast({
        variant: "destructive",
        title: t('users.errors.title'),
        description: t('users.errors.notFound')
      });
      return;
    }

    // Verificar se é o último administrador
    if (isUltimoAdmin(usuarioId) && usuario.ativo) {
      toast({
        variant: "destructive",
        title: t('users.errors.notAllowedTitle'),
        description: t('users.errors.lastAdminDisable')
      });
      return;
    }

    try {
      await db.usuarios.update(usuarioId, {
        ativo: !usuario.ativo,
        updatedAt: new Date()
      });
      const usuarioAtualizado = await db.usuarios.get(usuarioId);
      if (usuarioAtualizado) {
        await enqueueSyncItem({
          tipo: 'USUARIO',
          table: 'usuarios',
          data: usuarioAtualizado as unknown as Record<string, unknown>,
          prioridade: 1
        });
      }

      toast({
        title: t('users.status.toastTitle'),
        description: t('users.status.toastDescription', { status: !usuario.ativo ? t('users.status.active') : t('users.status.inactive') })
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('users.errors.title'),
        description: t('users.errors.statusUpdate')
      });
    }
  };

  // Excluir usuário
  const handleExcluir = (usuarioId: number) => {
    const usuario = usuarios?.find(u => u.id === usuarioId);
    if (!usuario) {
      toast({
        variant: "destructive",
        title: t('users.errors.title'),
        description: t('users.errors.notFound')
      });
      return;
    }

    // Verificar se está tentando excluir a si mesmo
    if (currentUser?.email === usuario.email) {
      toast({
        variant: "destructive",
        title: t('users.errors.notAllowedTitle'),
        description: t('users.errors.selfDelete')
      });
      return;
    }

    // Verificar se é o último administrador
    if (isUltimoAdmin(usuarioId)) {
      toast({
        variant: "destructive",
        title: t('users.errors.notAllowedTitle'),
        description: t('users.errors.lastAdminDelete')
      });
      return;
    }

    setUsuarioParaExcluir({ id: usuarioId, nome: usuario.nome });
    setConfirmacaoExclusao(false);
  };

  const confirmarExclusao = async () => {
    if (!usuarioParaExcluir) return;

    if (!confirmacaoExclusao) {
      setConfirmacaoExclusao(true);
      return;
    }

    try {
      await db.usuarios.delete(usuarioParaExcluir.id);
      
      toast({
        title: t('users.delete.toastTitle'),
        description: t('users.delete.toastDescription', { name: usuarioParaExcluir.nome })
      });

      setUsuarioParaExcluir(null);
      setConfirmacaoExclusao(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('users.errors.title'),
        description: t('users.errors.delete')
      });
    }
  };

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: t('users.breadcrumb') }]} />
      
      <PageHeader
        title={t('users.title')}
        description={t('users.description')}
        actions={
          <div className="flex gap-2">
            <Button onClick={async () => {
              setSyncing(true);
              try {
                await pullDataFromServer();
                toast({
                  title: t('users.syncTitle', { defaultValue: 'Usuários sincronizados' }),
                  description: t('users.syncDescription', { defaultValue: 'Dados do servidor foram carregados com sucesso.' })
                });
              } catch (error) {
                toast({
                  variant: 'destructive',
                  title: t('users.syncErrorTitle', { defaultValue: 'Erro ao sincronizar' }),
                  description: t('users.syncErrorDescription', { defaultValue: 'Não foi possível buscar usuários do servidor.' })
                });
              } finally {
                setSyncing(false);
              }
            }} disabled={syncing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {t('users.syncButton', { defaultValue: 'Sincronizar' })}
            </Button>
            <Button onClick={() => navigate('/usuarios/novo')}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t('users.new')}
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {/* Busca e Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('users.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={filtroPerfil} onValueChange={setFiltroPerfil}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('users.filters.profile')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">{t('users.filters.allProfiles')}</SelectItem>
                <SelectItem value="ADMINISTRADOR">{t('users.profiles.admin')}</SelectItem>
              <SelectItem value="COLETISTA">{t('users.profiles.collector')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder={t('users.filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">{t('users.filters.allStatuses')}</SelectItem>
                <SelectItem value="ATIVO">{t('users.status.active')}</SelectItem>
                <SelectItem value="INATIVO">{t('users.status.inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('users.table.name')}</TableHead>
                  <TableHead>{t('users.table.login')}</TableHead>
                  <TableHead>{t('users.table.profile')}</TableHead>
                  <TableHead>{t('users.table.status')}</TableHead>
                  <TableHead>{t('users.table.lastAccess')}</TableHead>
                  <TableHead className="text-right">{t('users.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios?.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getProfileLabel(usuario.perfil)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.ativo ? 'success' : 'destructive'}>
                        {usuario.ativo ? t('users.status.active') : t('users.status.inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {usuario.updatedAt ? formatDateTime(usuario.updatedAt) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/usuarios/${usuario.id}`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t('users.actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRedefinirSenha(usuario.id!)}>
                            <KeyRound className="h-4 w-4 mr-2" />
                            {t('users.actions.resetPassword')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(usuario.id!)}
                            disabled={isUltimoAdmin(usuario.id!) && usuario.ativo}
                          >
                            {usuario.ativo ? (
                              <>
                                <PowerOff className="h-4 w-4 mr-2" />
                                {t('users.actions.deactivate')}
                              </>
                            ) : (
                              <>
                                <Power className="h-4 w-4 mr-2" />
                                {t('users.actions.activate')}
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleExcluir(usuario.id!)}
                            className="text-destructive"
                            disabled={currentUser?.email === usuario.email || isUltimoAdmin(usuario.id!)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('users.actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredUsuarios || filteredUsuarios.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t('users.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Redefinir Senha */}
      <Dialog open={!!usuarioParaRedefinir} onOpenChange={(open) => !open && setUsuarioParaRedefinir(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{t('users.resetPassword.title')}</DialogTitle>
            <DialogDescription>
              {t('users.resetPassword.description', { name: usuarioParaRedefinir?.nome })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t('users.resetPassword.tempLabel')}</Label>
              <div className="mt-2 p-3 bg-muted rounded-md font-mono text-lg text-center">
                {senhaTemporaria}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t('users.resetPassword.tempHelp')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUsuarioParaRedefinir(null)}>
              {t('common.close')}
            </Button>
            <Button onClick={confirmarRedefinicaoSenha}>
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Excluir Usuário */}
      <Dialog open={!!usuarioParaExcluir} onOpenChange={(open) => !open && setUsuarioParaExcluir(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t('users.delete.title')}
            </DialogTitle>
            <DialogDescription>
              {confirmacaoExclusao 
                ? t('users.delete.confirmHard', { name: usuarioParaExcluir?.nome })
                : t('users.delete.confirmSoft', { name: usuarioParaExcluir?.nome })
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setUsuarioParaExcluir(null);
              setConfirmacaoExclusao(false);
            }}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmarExclusao}
              className={confirmacaoExclusao ? 'bg-destructive' : ''}
            >
              {confirmacaoExclusao ? t('users.delete.confirmAction') : t('users.actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
