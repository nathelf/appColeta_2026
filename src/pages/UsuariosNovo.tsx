import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';

export default function UsuariosNovo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [perfil, setPerfil] = useState<'ADMINISTRADOR' | 'OPERADOR' | 'SUPERVISOR'>('OPERADOR');
  const [ativo, setAtivo] = useState(true);

  const handleSalvar = async () => {
    if (!nome || !email) {
      toast({
        variant: "destructive",
        title: t('usersNew.errors.title'),
        description: t('usersNew.errors.required')
      });
      return;
    }

    try {
      await db.usuarios.add({
        uuid: crypto.randomUUID(),
        nome,
        email,
        perfil,
        ativo,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast({
        title: t('usersNew.successTitle'),
        description: t('usersNew.successDescription')
      });

      navigate('/usuarios');
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('usersNew.errors.title'),
        description: t('usersNew.errors.save')
      });
    }
  };

  return (
    <AppLayout>
      <Breadcrumb items={[
        { label: t('users.breadcrumb'), href: '/usuarios' },
        { label: t('usersNew.title') }
      ]} />
      
      <PageHeader
        title={t('usersNew.title')}
        description={t('usersNew.description')}
      />

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>{t('usersNew.sectionTitle')}</CardTitle>
            <CardDescription>
              {t('usersNew.sectionDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">{t('usersNew.fields.name')}</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder={t('usersNew.fields.namePlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="email">{t('usersNew.fields.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('usersNew.fields.emailPlaceholder')}
              />
            </div>

            <div>
              <Label htmlFor="perfil">{t('usersNew.fields.profile')}</Label>
              <Select value={perfil} onValueChange={(v: any) => setPerfil(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMINISTRADOR">{t('users.profiles.admin')}</SelectItem>
                  <SelectItem value="SUPERVISOR">{t('users.profiles.supervisor')}</SelectItem>
                  <SelectItem value="OPERADOR">{t('users.profiles.operator')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div>
                <Label htmlFor="ativo">{t('usersNew.fields.status')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('usersNew.fields.statusHelp')}
                </p>
              </div>
              <Switch
                id="ativo"
                checked={ativo}
                onCheckedChange={setAtivo}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/usuarios')}
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSalvar} className="flex-1">
                {t('common.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
