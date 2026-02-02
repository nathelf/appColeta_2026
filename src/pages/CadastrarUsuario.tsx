import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { formatCPF, validateCPF } from '@/lib/cpf';
import { dateDDMMYYYYToISO } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';
import { routes } from '@/lib/routes';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CadastrarUsuario() {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [usuario, setUsuario] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    setCpf(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validações
      if (cpf && !validateCPF(cpf)) {
        toast({
          title: t('usersCreate.errors.invalidCpfTitle'),
          description: t('usersCreate.errors.invalidCpfDescription'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (senha.length < 8) {
        toast({
          title: t('usersCreate.errors.shortPasswordTitle'),
          description: t('usersCreate.errors.shortPasswordDescription'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (senha !== confirmarSenha) {
        toast({
          title: t('usersCreate.errors.passwordMismatchTitle'),
          description: t('usersCreate.errors.passwordMismatchDescription'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const dataNascimentoISO = dataNascimento ? dateDDMMYYYYToISO(dataNascimento) : '';
      if (dataNascimento && !dataNascimentoISO) {
        toast({
          title: t('usersCreate.errors.invalidBirthDateTitle'),
          description: t('usersCreate.errors.invalidBirthDateDescription'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Verificar unicidade
      const cpfNumeros = cpf.replace(/\D/g, '');
      if (cpfNumeros) {
        const cpfExists = await db.maes.where('cpf').equals(cpfNumeros).first();
        if (cpfExists) {
          toast({
            title: t('usersCreate.errors.cpfExistsTitle'),
            description: t('usersCreate.errors.cpfExistsDescription'),
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      const userExists = await db.usuarios.where('email').equals(usuario).first();
      if (userExists) {
        toast({
          title: t('usersCreate.errors.userExistsTitle'),
          description: t('usersCreate.errors.userExistsDescription'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Criar usuário
      await db.usuarios.add({
        nome,
        email: usuario,
        perfil: 'OPERADOR',
        ativo: status === 'ATIVO',
        dataNascimento: dataNascimentoISO || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast({
        title: t('usersCreate.successTitle'),
        description: t('usersCreate.successDescription'),
      });

      navigate(routes.usuarios.root);
    } catch (error) {
      toast({
        title: t('usersCreate.errors.createTitle'),
        description: t('usersCreate.errors.createDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title={t('usersCreate.title')} description={t('usersCreate.description')} />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('usersCreate.sectionTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">{t('usersCreate.fields.name')}</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">{t('usersCreate.fields.cpf')}</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder={t('usersCreate.fields.cpfPlaceholder')}
                maxLength={14}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="usuario">{t('usersCreate.fields.login')}</Label>
              <Input
                id="usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataNascimento">{t('usersCreate.fields.birthDate')}</Label>
              <Input
                id="dataNascimento"
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                placeholder={t('usersCreate.fields.birthDatePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('usersCreate.fields.status')}</Label>
              <Select value={status} onValueChange={(value: 'ATIVO' | 'INATIVO') => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVO">{t('users.status.active')}</SelectItem>
                  <SelectItem value="INATIVO">{t('users.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">{t('usersCreate.fields.initialPassword')}</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">{t('usersCreate.fields.confirmPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? t('common.processing') : t('common.save')}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(routes.usuarios.root)} className="flex-1">
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
