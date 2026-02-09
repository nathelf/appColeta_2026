import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { formatCPF, validateCPF } from '@/lib/cpf';
import { dateDDMMYYYYToISO } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { enqueueSyncItem } from '@/lib/sync';

interface CadastrarUsuarioModalProps {
  onClose: () => void;
}

export default function CadastrarUsuarioModal({ onClose }: CadastrarUsuarioModalProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [usuario, setUsuario] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState<'ADMINISTRADOR' | 'COLETISTA'>('COLETISTA');
  const [status, setStatus] = useState<'ATIVO' | 'INATIVO'>('ATIVO');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
          title: t('usersCreateModal.errors.invalidCpfTitle'),
          description: t('usersCreateModal.errors.invalidCpfDescription'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (senha.length < 8) {
        toast({
          title: t('usersCreateModal.errors.shortPasswordTitle'),
          description: t('usersCreateModal.errors.shortPasswordDescription'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (senha !== confirmarSenha) {
        toast({
          title: t('usersCreateModal.errors.passwordMismatchTitle'),
          description: t('usersCreateModal.errors.passwordMismatchDescription'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const dataNascimentoISO = dataNascimento ? dateDDMMYYYYToISO(dataNascimento) : '';
      if (dataNascimento && !dataNascimentoISO) {
        toast({
          title: t('usersCreateModal.errors.invalidBirthDateTitle'),
          description: t('usersCreateModal.errors.invalidBirthDateDescription'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Verificar unicidade
      const cpfNumeros = cpf.replace(/\D/g, '');
      if (cpfNumeros) {
        const cpfExists = await db.usuarios.where('cpf').equals(cpfNumeros).first();
        if (cpfExists) {
          toast({
            title: t('usersCreateModal.errors.cpfExistsTitle'),
            description: t('usersCreateModal.errors.cpfExistsDescription'),
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
      }

      const userExists = await db.usuarios.where('email').equals(usuario).first();
      if (userExists) {
        toast({
          title: t('usersCreateModal.errors.userExistsTitle'),
          description: t('usersCreateModal.errors.userExistsDescription'),
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Criar usuário
      const usuarioId = await db.usuarios.add({
        uuid: crypto.randomUUID(),
        nome,
        email: usuario,
        cpf: cpfNumeros || undefined,
        dataNascimento: dataNascimentoISO || undefined,
        perfil,
        ativo: status === 'ATIVO',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const novoUsuario = await db.usuarios.get(usuarioId);
      if (novoUsuario) {
        await enqueueSyncItem({
          tipo: 'USUARIO',
          table: 'usuarios',
          data: novoUsuario,
          prioridade: 1
        });
      }

      toast({
        title: t('usersCreateModal.successTitle'),
        description: t('usersCreateModal.successDescription'),
      });

      // Limpar formulário
      setNome('');
      setCpf('');
      setUsuario('');
      setDataNascimento('');
      setSenha('');
      setConfirmarSenha('');
      setPerfil('COLETISTA');
      setStatus('ATIVO');

      onClose();
    } catch (error) {
      toast({
        title: t('usersCreateModal.errors.createTitle'),
        description: t('usersCreateModal.errors.createDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">{t('usersCreateModal.fields.name')}</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cpf">{t('usersCreateModal.fields.cpf')}</Label>
          <Input
            id="cpf"
            value={cpf}
            onChange={(e) => handleCpfChange(e.target.value)}
            placeholder={t('usersCreateModal.fields.cpfPlaceholder')}
            maxLength={14}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="usuario">{t('usersCreateModal.fields.login')}</Label>
          <Input
            id="usuario"
            type="email"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataNascimento">{t('usersCreateModal.fields.birthDate')}</Label>
          <Input
            id="dataNascimento"
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            placeholder={t('usersCreateModal.fields.birthDatePlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="perfil">{t('usersCreateModal.fields.profile')}</Label>
          <Select value={perfil} onValueChange={(value: 'ADMINISTRADOR' | 'COLETISTA') => setPerfil(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMINISTRADOR">{t('users.profiles.admin')}</SelectItem>
              <SelectItem value="COLETISTA">{t('users.profiles.collector')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">{t('usersCreateModal.fields.status')}</Label>
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
          <Label htmlFor="senha">{t('usersCreateModal.fields.initialPassword')}</Label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">{t('usersCreateModal.fields.passwordHint')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmarSenha">{t('usersCreateModal.fields.confirmPassword')}</Label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? t('common.processing') : t('common.save')}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}






