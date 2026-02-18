import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Lock, Eye, EyeOff, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateLogin, login, setAuthUser } from '@/lib/auth';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';
import { ConnectivityIndicator } from '@/components/ConnectivityIndicator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import biometriaLogo from '@/assets/biometria-logo.png';
import babyHandsIllustration from '@/assets/c__Users_pante_AppData_Roaming_Cursor_User_workspaceStorage_e4040b0516a0875295437fc71987783f_images_iamgem_dedo-4a7e784a-20df-4076-8e7d-82e594b8228d.png';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [idioma, setIdioma] = useState('pt-BR');
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const [canRegisterFirst, setCanRegisterFirst] = useState<boolean | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSenha, setRegSenha] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const usuarioRef = useRef<HTMLInputElement | null>(null);
  const senhaRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const supportedLocales = ['pt-BR', 'en-US', 'es-ES'] as const;

  // Foca no campo de usuário quando a página carrega
  useEffect(() => {
    usuarioRef.current?.focus();
  }, []);

  useEffect(() => {
    const savedLocale = localStorage.getItem('app-locale') || 'pt-BR';
    const locale = supportedLocales.includes(savedLocale as (typeof supportedLocales)[number])
      ? savedLocale
      : 'pt-BR';
    setIdioma(locale);
    i18n.changeLanguage(locale);
  }, [i18n]);

  useEffect(() => {
    const raw = localStorage.getItem('login-remember');
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as { usuario?: string; senha?: string };
      if (saved?.usuario) {
        setUsuario(saved.usuario);
      }
      if (saved?.senha) {
        setSenha(saved.senha);
      }
      if (saved?.usuario || saved?.senha) {
        setRememberCredentials(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/first-user');
        let data: { hasUsers?: boolean } = {};
        try {
          data = await res.json();
        } catch {
          console.warn('[Login] first-user: resposta não-JSON. Status:', res.status, 'URL:', res.url);
          toast({
            title: 'API indisponível',
            description: 'O backend pode não estar rodando. Inicie com: npm run dev:backend (em outro terminal)',
            variant: 'destructive',
          });
          setCanRegisterFirst(true);
          return;
        }
        setCanRegisterFirst(data.hasUsers === false);
      } catch (err) {
        console.warn('[Login] first-user falhou:', (err as Error).message);
        setCanRegisterFirst(true);
      }
    };
    check();
  }, [registerOpen]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNome.trim() || !regEmail.trim() || !regSenha) {
      toast({ title: t('login.registerError'), description: t('login.registerFieldsRequired'), variant: 'destructive' });
      return;
    }
    if (regSenha.length < 8) {
      toast({ title: t('login.registerError'), description: t('login.registerPasswordMin'), variant: 'destructive' });
      return;
    }
    setRegLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: regNome.trim(), email: regEmail.trim(), senha: regSenha }),
      });
      let data: { detail?: string; error?: string; hint?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* resposta não-JSON: backend não rodando ou erro não tratado */
        const msg = res.status === 500
          ? 'Erro no servidor. Verifique se o backend está rodando (npm run dev:backend).'
          : t('login.registerError');
        throw new Error(msg);
      }
      if (!res.ok) {
        const msg = [data.detail || data.error || res.statusText, data.hint].filter(Boolean).join(' — ') || t('login.registerError');
        throw new Error(msg);
      }
      toast({ title: t('login.registerSuccess'), description: t('login.registerSuccessDesc') });
      setRegisterOpen(false);
      setRegNome('');
      setRegEmail('');
      setRegSenha('');
      setUsuario(regEmail.trim());
    } catch (err: unknown) {
      toast({ title: t('login.registerError'), description: (err as Error).message, variant: 'destructive' });
    } finally {
      setRegLoading(false);
    }
  };

  const handleIdiomaChange = (value: string) => {
    const locale = supportedLocales.includes(value as (typeof supportedLocales)[number]) ? value : 'pt-BR';
    setIdioma(locale);
    localStorage.setItem('app-locale', locale);
    i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
    document.documentElement.setAttribute('data-locale', locale);
  };

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const email = usuario.trim();
  const password = senha;

  // 🔹 Validação local
  const errors = validateLogin({
    email,
    senha: password,
  });

  if (errors.email || errors.senha) {
    toast({
      title: t('login.errors.invalidTitle'),
      description: errors.email || errors.senha,
      variant: 'destructive',
    });
    return;
  }

  setLoading(true);

  try {
    // 🔹 Backend
    const data = await login(email, password);

    if (data.usuario && data.token) {
      setAuthUser(data.usuario, data.token);

      if (rememberCredentials) {
        localStorage.setItem(
          'login-remember',
          JSON.stringify({
            usuario: email,
            senha: password,
          })
        );
      } else {
        localStorage.removeItem('login-remember');
      }

      toast({
        title: t('login.successTitle'),
        description: t('login.successDescription', {
          name: data.usuario.nome,
        }),
      });

      navigate('/termo-de-uso', { replace: true });

    } else {
      throw new Error('Resposta inválida do servidor');
    }

  } catch (error: any) {
    toast({
      title: t('login.errors.invalidTitle'),
      description:
        error.message || t('login.errors.connection'),
      variant: 'destructive',
    });

    setSenha('');
    senhaRef.current?.focus();

  } finally {
    setLoading(false);
  }
};


  const isFormValid = usuario.trim().length > 0 && senha.trim().length > 0;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#eef2f7] via-[#f3f6fa] to-[#edf0f5]">
        <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col lg:flex-row">
          <div className="relative hidden w-1/2 overflow-hidden lg:flex">
            <img
              src={babyHandsIllustration}
              alt={t('login.logoAlt')}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-slate-900/10 to-slate-900/20" />
          </div>

          <div className="flex w-full flex-1 items-center justify-center px-6 py-10 lg:w-1/2">
            <Card className="w-full max-w-lg border border-slate-200 bg-white shadow-2xl">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={biometriaLogo}
                      alt={t('login.logoAlt')}
                      className="h-10 w-10 object-contain"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t('login.title')}</p>
                      <p className="text-xs text-slate-600">{t('login.subtitle')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-40">
                      <Select value={idioma} onValueChange={handleIdiomaChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('login.languagePlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <ConnectivityIndicator />
                  </div>
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-semibold text-slate-900">
                    Bem-vindo ao Portal
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    {t('login.subtitle')}
                  </CardDescription>
                </div>
              </CardHeader>

              <form onSubmit={handleLogin} noValidate>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="usuario" className="text-sm text-slate-700">{t('login.emailLabel')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden />
                      <Input
                        id="usuario"
                        ref={usuarioRef}
                        type="email"
                        placeholder={t('login.emailPlaceholder')}
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        className="h-12 pl-10 bg-slate-50 border-slate-200 text-slate-800 shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                        autoComplete="username"
                        aria-label={t('login.emailLabel')}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-sm text-slate-700">{t('login.passwordLabel')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" aria-hidden />
                      <Input
                        id="senha"
                        ref={senhaRef}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('login.passwordPlaceholder')}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="h-12 pl-10 pr-12 bg-slate-50 border-slate-200 text-slate-800 shadow-sm transition focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                        autoComplete="current-password"
                        aria-label={t('login.passwordLabel')}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                        aria-pressed={showPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setForgotPasswordOpen(true)}
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        {t('login.forgotPassword')}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <Checkbox
                        checked={rememberCredentials}
                        onCheckedChange={(checked) => {
                          const value = checked === true;
                          setRememberCredentials(value);
                          if (!value) {
                            localStorage.removeItem('login-remember');
                          }
                        }}
                        aria-label={t('login.rememberMe')}
                      />
                      {t('login.rememberMe')}
                    </label>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <ShieldCheck className="h-4 w-4 text-slate-500" />
                    <span>{t('login.rememberWarning')}</span>
                  </div>
                  <p className="text-xs text-slate-500">{t('login.offlineHint')}</p>

                  {canRegisterFirst === true && (
                    <div className="pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setRegisterOpen(true)}
                        className="flex items-center justify-center gap-2 w-full py-2 text-sm text-primary hover:underline font-medium"
                      >
                        <UserPlus className="h-4 w-4" />
                        {t('login.registerFirstUser')}
                      </button>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-0">
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#0c63d4] to-[#0b58bf] text-white font-semibold shadow-md transition-all hover:brightness-110"
                    disabled={loading || !isFormValid}
                  >
                    {loading ? t('login.loggingIn') : t('login.loginButton')}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </div>

      <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />

      <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby="register-dialog-desc">
          <DialogHeader>
            <DialogTitle>{t('login.registerTitle')}</DialogTitle>
            <DialogDescription id="register-dialog-desc">
              {t('login.registerTitleDesc')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-nome">{t('login.registerName')}</Label>
              <Input
                id="reg-nome"
                value={regNome}
                onChange={(e) => setRegNome(e.target.value)}
                placeholder={t('login.registerNamePlaceholder')}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">{t('login.registerEmail')}</Label>
              <Input
                id="reg-email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder={t('login.registerEmailPlaceholder')}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-senha">{t('login.registerPassword')}</Label>
              <Input
                id="reg-senha"
                type="password"
                value={regSenha}
                onChange={(e) => setRegSenha(e.target.value)}
                placeholder={t('login.registerPasswordPlaceholder')}
                autoComplete="new-password"
                minLength={8}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRegisterOpen(false)} disabled={regLoading}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={regLoading}>
                {regLoading ? t('login.registerSending') : t('login.registerSubmit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
