import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { enqueueSyncItem } from '@/lib/sync';
import { TimePickerScroll } from '@/components/TimePickerScroll';
import { useTranslation } from 'react-i18next';
import { dateDDMMYYYYToISO } from '@/lib/utils';

export default function CadastroBebe() {
  const [nomeBebe, setNomeBebe] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [horaNascimento, setHoraNascimento] = useState('00:00:00');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getAuthUser();
  const { t } = useTranslation();

  useEffect(() => {
    const maeId = sessionStorage.getItem('mae_id');
    if (!maeId) {
      toast({
        title: t('collection.baby.errors.missingMotherTitle'),
        description: t('collection.baby.errors.missingMotherDescription'),
        variant: 'destructive',
      });
      navigate('/coleta/primeira');
    }
  }, [navigate, toast]);

  const handleIniciar = async () => {
    if (!dataNascimento) {
      toast({
        title: t('collection.baby.errors.requiredTitle'),
        description: t('collection.baby.errors.requiredDescription'),
        variant: 'destructive',
      });
      return;
    }

    const dataNascimentoISO = dateDDMMYYYYToISO(dataNascimento);
    if (!dataNascimentoISO) {
      toast({
        title: t('collection.baby.errors.invalidDateTitle'),
        description: t('collection.baby.errors.invalidDateDescription'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const maeId = parseInt(sessionStorage.getItem('mae_id')!);
      const scannerId = parseInt(sessionStorage.getItem('scanner_id')!);

      // Criar bebê
      const dataNasc = new Date(dataNascimentoISO);
      if (horaNascimento) {
        const [horas, minutos] = horaNascimento.split(':');
        dataNasc.setHours(parseInt(horas), parseInt(minutos));
      }

      const bebeId = await db.bebes.add({
        uuid: crypto.randomUUID(),
        maeId,
        nome: nomeBebe || undefined,
        dataNascimento: dataNasc,
        createdAt: new Date()
      });
      const bebe = await db.bebes.get(bebeId);
      if (bebe) {
        await enqueueSyncItem({
          tipo: 'BEBE',
          table: 'bebes',
          data: bebe,
          prioridade: 1
        });
      }

      // Criar sessão de coleta
      const sessaoId = await db.sessoesColeta.add({
        uuid: crypto.randomUUID(),
        usuarioId: user!.id,
        maeId,
        bebeId,
        scannerId,
        tipoSessao: 'PRIMEIRA_COLETA',
        matchingHabilitado: false,
        dataInicio: new Date(),
        status: 'EM_ANDAMENTO',
        syncStatus: 'PENDENTE',
        createdAt: new Date()
      });
      const sessao = await db.sessoesColeta.get(sessaoId);
      if (sessao) {
        await enqueueSyncItem({
          tipo: 'SESSAO',
          table: 'sessoes_coleta',
          data: sessao,
          prioridade: 2
        });
      }

      // Limpar session storage
      sessionStorage.removeItem('mae_id');
      sessionStorage.removeItem('scanner_id');

      toast({
        title: t('collection.baby.sessionStartedTitle'),
        description: t('collection.baby.sessionStartedDescription'),
      });

      navigate(`/coleta/sessao/${sessaoId}/captura`);
    } catch (error) {
      toast({
        title: t('collection.baby.errors.sessionTitle'),
        description: t('collection.baby.errors.sessionDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title={t('collection.baby.title')}
        description={t('collection.baby.description')}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('collection.baby.sectionTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nomeBebe">{t('collection.baby.nameLabel')}</Label>
            <Input
              id="nomeBebe"
              value={nomeBebe}
              onChange={(e) => setNomeBebe(e.target.value)}
              placeholder={t('collection.baby.namePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataNascimento">{t('collection.baby.birthDateLabel')}</Label>
            <Input
              id="dataNascimento"
            type="date"
              value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            placeholder={t('collection.baby.birthDatePlaceholder')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="horaNascimento">{t('collection.baby.birthTimeLabel')}</Label>
            <p className="text-xs text-muted-foreground mb-1">{t('collection.baby.birthTimeHelp')}</p>
            <TimePickerScroll 
              value={horaNascimento}
              onChange={setHoraNascimento}
            />
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleIniciar} 
              disabled={!dataNascimento || loading}
              className="w-full"
            >
              {loading ? t('collection.baby.starting') : t('collection.baby.startAction')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
