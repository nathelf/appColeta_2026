import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { Trash2, HardDrive } from 'lucide-react';

export default function Configuracoes() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [tema, setTema] = useState('light');
  const [idioma, setIdioma] = useState('pt-BR');
  const [notificacoes, setNotificacoes] = useState(true);
  const [storageUsage, setStorageUsage] = useState(0);
  const [storageText, setStorageText] = useState('');

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 MB';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
  };

  useEffect(() => {
    const storedLocale = localStorage.getItem('app-locale') || 'pt-BR';
    const storedNotifications = localStorage.getItem('app-notifications');
    setIdioma(storedLocale);
    setNotificacoes(storedNotifications ? storedNotifications === 'true' : true);
  }, []);

  useEffect(() => {
    if (theme) {
      setTema(theme);
    }
  }, [theme]);

  useEffect(() => {
    const carregarUsoStorage = async () => {
      setStorageText(t('settings.storageCalculating'));
      if (!navigator.storage?.estimate) {
        setStorageText(t('settings.storageUnavailable'));
        return;
      }
      try {
        const estimate = await navigator.storage.estimate();
        const usage = estimate.usage ?? 0;
        const quota = estimate.quota ?? 0;
        const percent = quota ? Math.min(100, Math.round((usage / quota) * 100)) : 0;
        setStorageUsage(percent);
        setStorageText(`${formatBytes(usage)} ${t('common.of')} ${formatBytes(quota)}`);
      } catch {
        setStorageText(t('settings.storageUnavailable'));
      }
    };
    carregarUsoStorage();
  }, [t]);

  const handleLimparDados = async () => {
    const confirmou = confirm(t('settings.confirmClearTitle'));
    if (!confirmou) return;

    try {
      await db.delete();
      localStorage.clear();
      sessionStorage.clear();
      toast({
        title: t('settings.clearedTitle'),
        description: t('settings.clearedDescription'),
        variant: "destructive"
      });
      window.location.href = '/login';
    } catch (error) {
      toast({
        title: t('settings.clearErrorTitle'),
        description: t('settings.clearErrorDescription'),
        variant: "destructive"
      });
    }
  };

  const handleSalvar = () => {
    setTheme(tema);
    localStorage.setItem('app-locale', idioma);
    localStorage.setItem('app-notifications', String(notificacoes));
    i18n.changeLanguage(idioma);
    document.documentElement.lang = idioma;
    document.documentElement.setAttribute('data-locale', idioma);
    toast({
      title: t('settings.savedTitle'),
      description: t('settings.savedDescription')
    });
  };

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: t('settings.title') }]} />
      
      <PageHeader
        title={t('settings.title')}
        description={t('settings.description')}
      />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.userPrefs')}</CardTitle>
            <CardDescription>
              {t('settings.userPrefsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tema">{t('settings.theme')}</Label>
              <Select value={tema} onValueChange={setTema}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings.themeLight')}</SelectItem>
                  <SelectItem value="dark">{t('settings.themeDark')}</SelectItem>
                  <SelectItem value="system">{t('settings.themeSystem')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="idioma">{t('settings.language')}</Label>
              <Select value={idioma} onValueChange={setIdioma}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="es-ES">Español</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="notificacoes">{t('settings.notifications')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.notificationsDescription')}
                </p>
              </div>
              <Switch
                id="notificacoes"
                checked={notificacoes}
                onCheckedChange={setNotificacoes}
              />
            </div>

            <Button onClick={handleSalvar} className="w-full">
              {t('settings.savePrefs')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.storageTitle')}</CardTitle>
            <CardDescription>
              {t('settings.storageDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{t('settings.quotaUsed')}</Label>
                <span className="text-sm font-medium">{storageUsage}%</span>
              </div>
              <Progress value={storageUsage} />
              <p className="text-sm text-muted-foreground mt-2">
                {storageText}
              </p>
            </div>

            <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <HardDrive className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t('settings.clearLocalData')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('settings.clearLocalDataDescription')}
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleLimparDados}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('common.clear')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.systemInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('settings.version')}</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('settings.lastSync')}</span>
              <span className="font-medium">{t('settings.lastSyncValue')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('settings.database')}</span>
              <span className="font-medium">IndexedDB v1</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
