import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { enqueueSyncItem } from '@/lib/sync';

export default function Formulario() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const faltantes = (location.state as any)?.faltantes ?? [];

  const [temperatura, setTemperatura] = useState('23.5');
  const [umidade, setUmidade] = useState('55');
  const [tipoMistura, setTipoMistura] = useState('');
  const [justificativa, setJustificativa] = useState('');
  const [mostrarJustificativa] = useState(false);

  const [pressaoSensor, setPressaoSensor] = useState('');
  const [comportamentoBebe, setComportamentoBebe] = useState('');
  const [umidadeMao, setUmidadeMao] = useState('');
  const [amamentacao, setAmamentacao] = useState('');
  const [facilidadePosicionar, setFacilidadePosicionar] = useState('');
  const [posicaoBebe, setPosicaoBebe] = useState('');
  const [interferencia, setInterferencia] = useState('');
  const [iluminacao, setIluminacao] = useState('');
  const [aceitacaoFamilia, setAceitacaoFamilia] = useState('');
  const [triagemNeonatal, setTriagemNeonatal] = useState('');

  const handleValidar = async () => {
    if (!temperatura || !umidade || !tipoMistura) {
      toast({
        variant: "destructive",
        title: t('form.errors.title'),
        description: t('form.errors.requiredFields')
      });
      return;
    }

    if (!pressaoSensor || !comportamentoBebe || !umidadeMao || !amamentacao || 
        !facilidadePosicionar || !posicaoBebe || !interferencia || !iluminacao || 
        !aceitacaoFamilia || !triagemNeonatal) {
      toast({
        variant: "destructive",
        title: t('form.errors.title'),
        description: t('form.errors.allQuestions')
      });
      return;
    }

    if (mostrarJustificativa && (!justificativa || justificativa.length < 10)) {
      toast({
        variant: "destructive",
        title: t('form.errors.title'),
        description: t('form.errors.justification')
      });
      return;
    }

    try {
      const formId = await db.formsColeta.add({
        uuid: crypto.randomUUID(),
        sessaoColetaId: Number(id),
        temperatura: parseFloat(temperatura),
        umidade: parseFloat(umidade),
        tipoMistura,
        questionarioVersao: 'v1.3',
        observacoes: JSON.stringify({
          pressaoSensor,
          comportamentoBebe,
          umidadeMao,
          amamentacao,
          facilidadePosicionar,
          posicaoBebe,
          interferencia,
          iluminacao,
          aceitacaoFamilia,
          triagemNeonatal
        }),
        justificativaParcial: justificativa || null,
        coletaRapida: false,
        createdAt: new Date()
      });

      const form = await db.formsColeta.get(formId);
      if (form) {
        await enqueueSyncItem({
          tipo: 'FORMULARIO',
          table: 'forms_coleta',
          data: form,
          prioridade: 3
        });
      }

      await db.sessoesColeta.update(Number(id), {
        status: 'CONCLUIDA',
        dataFim: new Date(),
        syncStatus: 'PENDENTE'
      });
      const sessao = await db.sessoesColeta.get(Number(id));
      if (sessao) {
        await enqueueSyncItem({
          tipo: 'SESSAO',
          table: 'sessoes_coleta',
          data: sessao,
          prioridade: 2
        });
      }

      toast({
        title: t('form.successTitle'),
        description: t('form.successDescription')
      });

      navigate(`/coleta/sessao/${id}/conclusao`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('form.errors.title'),
        description: t('form.errors.save')
      });
    }
  };

  return (
    <AppLayout>
      <Breadcrumb items={[
        { label: t('menu.collection'), href: '/coleta/primeira' },
        { label: t('capture.session'), href: `/coleta/sessao/${id}` },
        { label: t('form.title') }
      ]} />
      
      <PageHeader
        title={t('form.title')}
        description={t('form.description')}
      />

      {faltantes.length > 0 && (
        <Alert variant="warning" className="max-w-2xl">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('form.incompleteTitle')}</AlertTitle>
          <AlertDescription>
            {t('form.incompleteDescription', { fingers: faltantes.join(', ') })}
          </AlertDescription>
        </Alert>
      )}

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('form.environment.title')}</CardTitle>
            <CardDescription>
              {t('form.environment.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperatura">{t('form.environment.temperature')}</Label>
                <Input
                  id="temperatura"
                  type="number"
                  step="0.1"
                  value={temperatura}
                  onChange={(e) => setTemperatura(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="umidade">{t('form.environment.humidity')}</Label>
                <Input
                  id="umidade"
                  type="number"
                  value={umidade}
                  onChange={(e) => setUmidade(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mistura">{t('form.environment.mixType')}</Label>
              <Select value={tipoMistura} onValueChange={setTipoMistura}>
                <SelectTrigger>
                  <SelectValue placeholder={t('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mistura 1">{t('form.environment.mixOptions.mix1')}</SelectItem>
                  <SelectItem value="Mistura 3">{t('form.environment.mixOptions.mix3')}</SelectItem>
                  <SelectItem value="Álcool">{t('form.environment.mixOptions.alcohol')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('form.questionnaire.title')}</CardTitle>
            <CardDescription>
              {t('form.questionnaire.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>{t('form.questionnaire.q1.label')}</Label>
              <Select value={pressaoSensor} onValueChange={setPressaoSensor}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve_constante">{t('form.questionnaire.q1.options.lightConstant')}</SelectItem>
                  <SelectItem value="leve_variacoes">{t('form.questionnaire.q1.options.lightVariations')}</SelectItem>
                  <SelectItem value="irregular">{t('form.questionnaire.q1.options.irregular')}</SelectItem>
                  <SelectItem value="forte_maioria">{t('form.questionnaire.q1.options.strongMajority')}</SelectItem>
                  <SelectItem value="forte_constante">{t('form.questionnaire.q1.options.strongConstant')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('form.questionnaire.q2.label')}</Label>
              <Select value={comportamentoBebe} onValueChange={setComportamentoBebe}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dormiu_toda">{t('form.questionnaire.q2.options.sleptAll')}</SelectItem>
                  <SelectItem value="acordou_calmo">{t('form.questionnaire.q2.options.awokeCalm')}</SelectItem>
                  <SelectItem value="acordou_agitado">{t('form.questionnaire.q2.options.awokeAgitated')}</SelectItem>
                  <SelectItem value="acordado_calmo">{t('form.questionnaire.q2.options.awakeCalm')}</SelectItem>
                  <SelectItem value="acordado_agitado">{t('form.questionnaire.q2.options.awakeAgitated')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('form.questionnaire.q3.label')}</Label>
              <Select value={umidadeMao} onValueChange={setUmidadeMao}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seca_toda">{t('form.questionnaire.q3.options.dryAll')}</SelectItem>
                  <SelectItem value="suada_seca">{t('form.questionnaire.q3.options.sweatyDried')}</SelectItem>
                  <SelectItem value="voltou_suar">{t('form.questionnaire.q3.options.sweatyAgain')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('form.questionnaire.q4.label')}</Label>
              <Select value={amamentacao} onValueChange={setAmamentacao}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fora_peito">{t('form.questionnaire.q4.options.outside')}</SelectItem>
                  <SelectItem value="amamentou_momento">{t('form.questionnaire.q4.options.some')}</SelectItem>
                  <SelectItem value="amamentou_toda">{t('form.questionnaire.q4.options.all')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('form.questionnaire.q5.label')}</Label>
              <Select value={facilidadePosicionar} onValueChange={setFacilidadePosicionar}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexiveis_imediato">{t('form.questionnaire.q5.options.flexibleImmediate')}</SelectItem>
                  <SelectItem value="flexiveis_tentativas">{t('form.questionnaire.q5.options.flexibleAttempts')}</SelectItem>
                  <SelectItem value="rigidez_ajustes">{t('form.questionnaire.q5.options.slightRigidity')}</SelectItem>
                  <SelectItem value="rigidos_esforco">{t('form.questionnaire.q5.options.rigidEffort')}</SelectItem>
                  <SelectItem value="fechados">{t('form.questionnaire.q5.options.closed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('form.questionnaire.q6.label')}</Label>
              <Select value={posicaoBebe} onValueChange={setPosicaoBebe}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="berco">{t('form.questionnaire.q6.options.crib')}</SelectItem>
                  <SelectItem value="colo">{t('form.questionnaire.q6.options.lap')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('form.questionnaire.q7.label')}</Label>
              <Select value={interferencia} onValueChange={setInterferencia}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">{t('form.questionnaire.q7.options.yes')}</SelectItem>
                  <SelectItem value="nao">{t('form.questionnaire.q7.options.no')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('form.questionnaire.q8.label')}</Label>
              <Select value={iluminacao} onValueChange={setIluminacao}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="muito_fraca">{t('form.questionnaire.q8.options.veryDim')}</SelectItem>
                  <SelectItem value="fraca">{t('form.questionnaire.q8.options.dim')}</SelectItem>
                  <SelectItem value="adequada">{t('form.questionnaire.q8.options.adequate')}</SelectItem>
                  <SelectItem value="forte">{t('form.questionnaire.q8.options.strong')}</SelectItem>
                  <SelectItem value="muito_forte">{t('form.questionnaire.q8.options.veryStrong')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('form.questionnaire.q9.label')}</Label>
              <Select value={aceitacaoFamilia} onValueChange={setAceitacaoFamilia}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="resistencia">{t('form.questionnaire.q9.options.resistance')}</SelectItem>
                  <SelectItem value="neutra">{t('form.questionnaire.q9.options.neutral')}</SelectItem>
                  <SelectItem value="entusiasmo">{t('form.questionnaire.q9.options.enthusiasm')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('form.questionnaire.q10.label')}</Label>
              <Select value={triagemNeonatal} onValueChange={setTriagemNeonatal}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder={t('form.selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nao_realizado">{t('form.questionnaire.q10.options.notDone')}</SelectItem>
                  <SelectItem value="normal">{t('form.questionnaire.q10.options.normal')}</SelectItem>
                  <SelectItem value="alteracao">{t('form.questionnaire.q10.options.altered')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {mostrarJustificativa && (
          <Card className="border-yellow-500/50">
            <CardHeader>
            <CardTitle className="text-yellow-600">{t('form.justification.title')}</CardTitle>
              <CardDescription>
              {t('form.justification.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="justificativa" className="text-yellow-600">
              {t('form.justification.label')}
              </Label>
              <Textarea
                id="justificativa"
              placeholder={t('form.justification.placeholder')}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate(`/coleta/sessao/${id}/captura`)}
            className="flex-1"
          >
            {t('common.back')}
          </Button>
          <Button 
            variant="outline"
            onClick={handleValidar} 
            className="flex-1"
          >
            {t('common.finish')}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
