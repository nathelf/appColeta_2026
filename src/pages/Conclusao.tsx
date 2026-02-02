import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Clock, BarChart3, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Conclusao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const getSessionTypeLabel = (tipo?: string) =>
    tipo ? t(`sessionTypes.${tipo}`, { defaultValue: tipo }) : '-';
  const getFingerTypeLabel = (tipo?: string) =>
    tipo ? t(`fingerTypes.${tipo}`, { defaultValue: tipo.replace('_', ' ') }) : '-';
  const getFingerResultLabel = (resultado?: string) =>
    resultado ? t(`fingerResults.${resultado}`, { defaultValue: resultado }) : '-';

  const sessao = useLiveQuery(() => db.sessoesColeta.get(Number(id)));
  const mae = useLiveQuery(() => sessao ? db.maes.get(sessao.maeId) : undefined, [sessao]);
  const bebe = useLiveQuery(() => sessao ? db.bebes.get(sessao.bebeId) : undefined, [sessao]);
  const dedos = useLiveQuery(() => db.dedosColeta.where('sessaoColetaId').equals(Number(id)).toArray());

  const sucessos = dedos?.filter(d => d.resultado === 'SUCESSO').length || 0;
  const falhas = dedos?.filter(d => d.resultado === 'FALHA').length || 0;
  const parciais = dedos?.filter(d => d.resultado === 'PARCIAL').length || 0;

  const tempoDecorrido = sessao?.dataFim && sessao?.dataInicio
    ? Math.round((new Date(sessao.dataFim).getTime() - new Date(sessao.dataInicio).getTime()) / 1000 / 60)
    : 0;

  return (
    <AppLayout>
      <Breadcrumb items={[
        { label: t('menu.collection'), href: '/coleta/primeira' },
        { label: t('capture.session'), href: `/coleta/sessao/${id}` },
        { label: t('conclusion.title') }
      ]} />
      
      <PageHeader
        title={t('conclusion.title')}
        description={t('conclusion.description')}
      />

      <div className="max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('conclusion.sessionInfoTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{t('conclusion.motherLabel')}</p>
                <p className="font-medium">{mae?.nome}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('conclusion.babyLabel')}</p>
                <p className="font-medium">{bebe?.nome || t('conclusion.babyNoName')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('conclusion.typeLabel')}</p>
                <Badge variant="outline">{getSessionTypeLabel(sessao?.tipoSessao)}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('conclusion.durationLabel')}</p>
                <p className="font-medium">{t('conclusion.durationValue', { minutes: tempoDecorrido })}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{t('conclusion.syncLabel')}</span>
              </div>
              <Badge variant={sessao?.syncStatus === 'SINCRONIZADO' ? 'success' : 'warning'}>
                {sessao?.syncStatus === 'SINCRONIZADO' ? t('conclusion.syncSent') : t('conclusion.syncPending')}
              </Badge>
            </div>

            {sessao?.matchingHabilitado && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{t('conclusion.matching')}</span>
                </div>
                <Badge variant="outline">{t('conclusion.enabled')}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('conclusion.resultsTitle')}</CardTitle>
            <CardDescription>
              {t('conclusion.resultsDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 rounded-lg bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
                <p className="text-2xl font-bold">{sucessos}</p>
                <p className="text-sm text-muted-foreground">{t('conclusion.success')}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/10">
                <Clock className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-2xl font-bold">{parciais}</p>
                <p className="text-sm text-muted-foreground">{t('conclusion.partial')}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-bold">{falhas}</p>
                <p className="text-sm text-muted-foreground">{t('conclusion.failure')}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              {dedos?.map((dedo) => (
                <div key={dedo.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                  <span className="text-sm">{getFingerTypeLabel(dedo.tipoDedo)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{dedo.qualidade}%</span>
                    <Badge variant={
                      dedo.resultado === 'SUCESSO' ? 'success' : 
                      dedo.resultado === 'PARCIAL' ? 'warning' : 
                      'destructive'
                    }>
                      {getFingerResultLabel(dedo.resultado)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button onClick={() => navigate('/coleta/primeira')} className="w-full">
            {t('conclusion.newSession')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/sessoes')} className="w-full">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('conclusion.viewSessions')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/relatorios')} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            {t('conclusion.reports')}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
