import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, User, Eye, EyeOff, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateLogin, setAuthUser, getAuthUser } from '@/lib/auth';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';
import { ConnectivityIndicator } from '@/components/ConnectivityIndicator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import biometriaLogo from '@/assets/biometria-logo.png';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [idioma, setIdioma] = useState('pt-BR');

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

    const username = usuario.trim();
    const password = senha;

    if (!username || !password) {
      toast({
        title: t('login.errors.missingFieldsTitle'),
        description: t('login.errors.missingFieldsDescription'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await validateLogin(username, password);

      if (result.success && result.user) {
        setAuthUser(result.user);

        toast({
          title: t('login.successTitle'),
          description: t('login.successDescription', { name: result.user.name }),
        });

        // 🔵 AQUI MANTEMOS O QUE VOCÊ PEDIU:
        navigate('/termo-de-uso', { replace: true });

      } else {
        toast({
          title: t('login.errors.invalidTitle'),
          description: result.message || t('login.errors.invalidDescription'),
          variant: 'destructive',
        });

        setSenha('');
        senhaRef.current?.focus();
      }
    } catch (error) {
      toast({
        title: t('login.errors.invalidTitle'),
        description: t('login.errors.connection'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = usuario.trim().length > 0 && senha.trim().length > 0;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fb] via-[#f3f6fa] to-[#eef2f7]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
          <header className="flex flex-wrap items-center justify-between gap-4">
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
            <div className="flex items-center gap-3">
              <div className="w-44">
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
          </header>

          <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border border-slate-200 bg-white/95 shadow-xl">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl font-semibold text-slate-900">
                  {t('login.title')}
                </CardTitle>
                <CardDescription className="text-sm text-slate-600">
                  {t('login.subtitle')}
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleLogin} noValidate>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="usuario" className="text-sm text-slate-700">{t('login.emailLabel')}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden />
                      <Input
                        id="usuario"
                        ref={usuarioRef}
                        type="email"
                        placeholder={t('login.emailPlaceholder')}
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        className="h-12 pl-10 bg-slate-50 border-slate-200 focus-visible:ring-primary focus-visible:ring-offset-0"
                        autoComplete="username"
                        aria-label={t('login.emailLabel')}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-sm text-slate-700">{t('login.passwordLabel')}</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden />
                      <Input
                        id="senha"
                        ref={senhaRef}
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('login.passwordPlaceholder')}
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="h-12 pl-10 pr-12 bg-slate-50 border-slate-200 focus-visible:ring-primary focus-visible:ring-offset-0"
                        autoComplete="current-password"
                        aria-label={t('login.passwordLabel')}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                        aria-pressed={showPassword}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      {t('login.forgotPassword')}
                    </button>
                    <p className="text-xs text-slate-500">{t('login.offlineHint')}</p>
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-0">
                  <Button
                    type="submit"
                    className="w-full h-12 bg-[#0c63d4] hover:bg-[#0b58bf] text-white font-semibold shadow-md transition-colors"
                    disabled={loading || !isFormValid}
                  >
                    {loading ? t('login.loggingIn') : t('login.loginButton')}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            <Card className="border border-slate-200 bg-white/90 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-semibold text-slate-900">{t('login.testAccessTitle')}</CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  {t('login.testAccessDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-xs">
                  <span className="font-semibold text-slate-800">{t('login.testAccessAdmin')}</span>
                  <span className="font-mono text-[11px] text-slate-600">{t('login.testAccessAdminCreds')}</span>
                </div>
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-xs">
                  <span className="font-semibold text-slate-800">{t('login.testAccessCollector')}</span>
                  <span className="font-mono text-[11px] text-slate-600">{t('login.testAccessCollectorCreds')}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {t('login.testAccessNote')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
    </>
  );
}
