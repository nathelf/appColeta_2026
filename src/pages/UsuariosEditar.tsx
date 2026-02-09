import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { formatCPF, validateCPF } from '@/lib/cpf';
import { dateDDMMYYYYToISO, dateISOToDDMMYYYY } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { enqueueSyncItem } from '@/lib/sync';

export default function UsuariosEditar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [usuario, setUsuario] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [perfil, setPerfil] = useState<'ADMINISTRADOR' | 'COLETISTA'>('COLETISTA');
  const [ativo, setAtivo] = useState(true);
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarUsuario = async () => {
      if (!id) return;
      
      try {
        const usuarioData = await db.usuarios.get(Number(id));
        if (usuarioData) {
          setNome(usuarioData.nome);
          setCpf(usuarioData.cpf || '');
          setUsuario(usuarioData.email);
          const dataFormatada = usuarioData.dataNascimento
            ? (usuarioData.dataNascimento.includes('-')
              ? dateISOToDDMMYYYY(usuarioData.dataNascimento)
              : usuarioData.dataNascimento)
            : '';
          setDataNascimento(dataFormatada);
          setPerfil(usuarioData.perfil === 'ADMINISTRADOR' ? 'ADMINISTRADOR' : 'COLETISTA');
          setAtivo(usuarioData.ativo);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: t('usersEdit.errors.title'),
          description: t('usersEdit.errors.load')
        });
      } finally {
        setLoading(false);
      }
    };

    carregarUsuario();
  }, [id, toast]);

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted);
  };

  const handleSalvar = async () => {
    if (!nome || !usuario) {
      toast({
        variant: "destructive",
        title: t('usersEdit.errors.title'),
        description: t('usersEdit.errors.required')
      });
      return;
    }

    if (cpf && !validateCPF(cpf)) {
      toast({
        variant: "destructive",
        title: t('usersEdit.errors.title'),
        description: t('usersEdit.errors.invalidCpf')
      });
      return;
    }

    if (senha && senha.length < 8) {
      toast({
        variant: "destructive",
        title: t('usersEdit.errors.title'),
        description: t('usersEdit.errors.minPassword')
      });
      return;
    }

    if (senha && senha !== confirmarSenha) {
      toast({
        variant: "destructive",
        title: t('usersEdit.errors.title'),
        description: t('usersEdit.errors.passwordMismatch')
      });
      return;
    }

    const dataNascimentoISO = dataNascimento ? dateDDMMYYYYToISO(dataNascimento) : '';
    if (dataNascimento && !dataNascimentoISO) {
      toast({
        variant: "destructive",
        title: t('usersEdit.errors.title'),
        description: t('usersEdit.errors.invalidBirthDate'),
      });
      return;
    }

    try {
      const updateData: any = {
        nome,
        email: usuario,
        perfil,
        ativo,
        updatedAt: new Date()
      };

      if (cpf) updateData.cpf = cpf;
      if (dataNascimentoISO) updateData.dataNascimento = dataNascimentoISO;
      if (senha) updateData.senha = senha;

      await db.usuarios.update(Number(id), updateData);
      const usuarioAtualizado = await db.usuarios.get(Number(id));
      if (usuarioAtualizado) {
        await enqueueSyncItem({
          tipo: 'USUARIO',
          table: 'usuarios',
          data: usuarioAtualizado,
          prioridade: 1
        });
      }

      toast({
        title: t('usersEdit.successTitle'),
        description: t('usersEdit.successDescription')
      });

      navigate('/usuarios');
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('usersEdit.errors.title'),
        description: t('usersEdit.errors.save')
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Breadcrumb items={[
        { label: t('users.breadcrumb'), href: '/usuarios' },
        { label: t('usersEdit.title') }
      ]} />
      
      <PageHeader
        title={t('usersEdit.title')}
        description={t('usersEdit.description')}
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t('usersEdit.sectionTitle')}</CardTitle>
            <CardDescription>
              {t('usersEdit.sectionDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">{t('usersEdit.fields.name')}</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="cpf">{t('usersEdit.fields.cpf')}</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder={t('usersEdit.fields.cpfPlaceholder')}
                maxLength={14}
              />
            </div>

            <div>
              <Label htmlFor="usuario">{t('usersEdit.fields.login')}</Label>
              <Input
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dataNascimento">{t('usersEdit.fields.birthDate')}</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                placeholder={t('usersEdit.fields.birthDatePlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="perfil">{t('usersEdit.fields.profile')}</Label>
              <Select value={perfil} onValueChange={(v: any) => setPerfil(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRADOR">{t('users.profiles.admin')}</SelectItem>
                  <SelectItem value="COLETISTA">{t('users.profiles.collector')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="ativo">{t('usersEdit.fields.status')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('usersEdit.fields.statusHelp')}
                </p>
              </div>
              <Switch
                id="ativo"
                checked={ativo}
                onCheckedChange={setAtivo}
              />
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-4">{t('usersEdit.passwordSectionTitle')}</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="senha">{t('usersEdit.fields.newPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showSenha ? "text" : "password"}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder={t('usersEdit.fields.newPasswordPlaceholder')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha(!showSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmarSenha">{t('usersEdit.fields.confirmPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      type={showConfirmar ? "text" : "password"}
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmar(!showConfirmar)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/usuarios')}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={handleSalvar} 
                className="flex-1 bg-button-primary hover:bg-button-primary/90"
              >
                {t('common.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
