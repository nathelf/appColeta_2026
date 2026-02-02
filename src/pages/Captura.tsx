import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Settings, Volume2, VolumeX, Zap, FastForward, BookOpen, X, Check, Circle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { HandDiagram } from '@/components/HandDiagram';
import { useTranslation } from 'react-i18next';

interface DedoCaptura {
  tipo: 'POLEGAR' | 'INDICADOR' | 'MEDIO' | 'ANELAR' | 'MINDINHO';
  label: string;
  qualidade: number;
  frames: number;
  status: 'pending' | 'capturing' | 'captured' | 'skipped';
}

export default function Captura() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [coletaRapida, setColetaRapida] = useState(false);
  const [avancarAuto, setAvancarAuto] = useState(false);
  const [somHabilitado, setSomHabilitado] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [confirmarFinalizarOpen, setConfirmarFinalizarOpen] = useState(false);
  const [hasPendencias, setHasPendencias] = useState(false);
  const [faltantes, setFaltantes] = useState<string[]>([]);
  const [maoAtual, setMaoAtual] = useState<'DIREITA' | 'ESQUERDA'>('DIREITA');
  const [dedoAtual, setDedoAtual] = useState(0);

  // All fingers of one hand, then the other (polegar, indicador, médio, anelar, mindinho)
  const [dedosDireita, setDedosDireita] = useState<DedoCaptura[]>([
    { tipo: 'POLEGAR', label: 'Polegar', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'INDICADOR', label: 'Indicador', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'MEDIO', label: 'Médio', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'ANELAR', label: 'Anelar', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'MINDINHO', label: 'Mindinho', qualidade: 0, frames: 0, status: 'pending' },
  ]);

  const [dedosEsquerda, setDedosEsquerda] = useState<DedoCaptura[]>([
    { tipo: 'POLEGAR', label: 'Polegar', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'INDICADOR', label: 'Indicador', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'MEDIO', label: 'Médio', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'ANELAR', label: 'Anelar', qualidade: 0, frames: 0, status: 'pending' },
    { tipo: 'MINDINHO', label: 'Mindinho', qualidade: 0, frames: 0, status: 'pending' },
  ]);

  const getFingerLabel = (tipo: DedoCaptura['tipo']) => {
    switch (tipo) {
      case 'POLEGAR':
        return t('capture.fingers.thumb');
      case 'INDICADOR':
        return t('capture.fingers.index');
      case 'MEDIO':
        return t('capture.fingers.middle');
      case 'ANELAR':
        return t('capture.fingers.ring');
      case 'MINDINHO':
        return t('capture.fingers.pinky');
      default:
        return tipo;
    }
  };

  const filtrarDedos = (dedos: DedoCaptura[]) => (
    coletaRapida ? dedos.filter(d => d.tipo === 'POLEGAR' || d.tipo === 'INDICADOR') : dedos
  );

  const getPrimeiroDedoDisponivel = (dedos: DedoCaptura[]) => {
    const filtrados = filtrarDedos(dedos);
    const primeiroDisponivel = filtrados.findIndex(d => d.status !== 'captured');
    return primeiroDisponivel === -1 ? 0 : primeiroDisponivel;
  };

  const dedosAtuais = maoAtual === 'DIREITA' ? dedosDireita : dedosEsquerda;
  const setDedosAtuais = maoAtual === 'DIREITA' ? setDedosDireita : setDedosEsquerda;

  const dedosFiltrados = filtrarDedos(dedosAtuais);
  const dedoIndexAtivo = Math.min(dedoAtual, Math.max(dedosFiltrados.length - 1, 0));
  const dedoAtivo = dedosFiltrados[dedoIndexAtivo];

  const simularCaptura = () => {
    const newDedos = [...dedosAtuais];
    const dedoIndex = dedosAtuais.findIndex(d => d.tipo === dedoAtivo.tipo);
    newDedos[dedoIndex].status = 'capturing';
    setDedosAtuais(newDedos);
    
    const interval = setInterval(() => {
      setDedosAtuais(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(d => d.tipo === dedoAtivo.tipo);
        if (updated[idx].qualidade < 100) {
          updated[idx].qualidade += 10;
          updated[idx].frames += 3;
        } else {
          clearInterval(interval);
          updated[idx].status = 'captured';
          
          if (avancarAuto) {
            setTimeout(() => {
              if (dedoAtual < dedosFiltrados.length - 1) {
                setDedoAtual(dedoAtual + 1);
              }
            }, 500);
          }
          
          toast({
            title: t('capture.toasts.capturedTitle'),
            description: t('capture.toasts.capturedDescription', {
              finger: getFingerLabel(dedoAtivo.tipo),
              hand: maoAtual === 'DIREITA' ? t('capture.hands.right') : t('capture.hands.left'),
            })
          });
        }
        return updated;
      });
    }, 300);
  };

  const handleFinalizar = () => {
    const pendentesDireita = dedosDireita
      .filter((d) => d.status !== 'captured')
      .map((d) => `${getFingerLabel(d.tipo)} (${t('capture.hands.right')})`);
    const pendentesEsquerda = dedosEsquerda
      .filter((d) => d.status !== 'captured')
      .map((d) => `${getFingerLabel(d.tipo)} (${t('capture.hands.left')})`);
    const pendentesOuPulados = [...pendentesDireita, ...pendentesEsquerda];

    setFaltantes(pendentesOuPulados);
    setHasPendencias(pendentesOuPulados.length > 0);
    setConfirmarFinalizarOpen(true);
  };

  const confirmarFinalizacao = () => {
    setConfirmarFinalizarOpen(false);
    navigate(`/coleta/sessao/${id}/captura-pincas`, {
      state: { faltantes },
    });
  };

  const getStatusIcon = (status: DedoCaptura['status']) => {
    switch (status) {
      case 'captured':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'capturing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'skipped':
        return <X className="h-4 w-4 text-yellow-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const totalDedosCapturados = 
    dedosDireita.filter(d => d.status === 'captured').length + 
    dedosEsquerda.filter(d => d.status === 'captured').length;

  const totalDedos = coletaRapida ? 4 : 10;
  const progressoPercentual = totalDedos === 0 ? 0 : (totalDedosCapturados / totalDedos) * 100;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb items={[
          { label: t('menu.collection'), href: '/coleta/primeira' },
          { label: t('capture.session'), href: `/coleta/sessao/${id}` },
          { label: t('capture.title') }
        ]} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            localStorage.removeItem('authUser');
            navigate('/');
          }}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <X className="h-4 w-4 mr-1" />
          {t('menu.logout')}
        </Button>
      </div>
      
      <PageHeader
        title={t('capture.title')}
        description={t('capture.progressSummary', { done: totalDedosCapturados, total: totalDedos })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Painel Esquerdo: Posição do Dedo */}
        <Card>
          <CardHeader>
            <CardTitle>{t('capture.fingerPosition')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mão Direita */}
            <div
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                maoAtual === 'DIREITA' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
              }`}
              onClick={() => {
                setMaoAtual('DIREITA');
                setDedoAtual(getPrimeiroDedoDisponivel(dedosDireita));
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${
                  maoAtual === 'DIREITA' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {t('capture.rightHand')}
                </h3>
                {maoAtual === 'DIREITA' && (
                  <div className="flex gap-2">
                    {dedosDireita.map(d => getStatusIcon(d.status))}
                  </div>
                )}
              </div>

              <HandDiagram
                hand="DIREITA"
                isActive={maoAtual === 'DIREITA'}
                currentFingerIndex={dedoIndexAtivo}
                fingers={dedosDireita}
              />

              <div className="mt-3 flex flex-wrap gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                {filtrarDedos(dedosDireita).map((dedo, index) => (
                  <Button
                    key={`direita-${dedo.tipo}`}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMaoAtual('DIREITA');
                      setDedoAtual(index);
                    }}
                    className={`h-7 px-3 text-xs ${
                      maoAtual === 'DIREITA' && dedoAtivo?.tipo === dedo.tipo ? 'bg-accent border-primary' : ''
                    }`}
                  >
                    {getFingerLabel(dedo.tipo)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Mão Esquerda */}
            <div
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                maoAtual === 'ESQUERDA' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
              }`}
              onClick={() => {
                setMaoAtual('ESQUERDA');
                setDedoAtual(getPrimeiroDedoDisponivel(dedosEsquerda));
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold ${
                  maoAtual === 'ESQUERDA' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {t('capture.leftHand')}
                </h3>
                {maoAtual === 'ESQUERDA' && (
                  <div className="flex gap-2">
                    {dedosEsquerda.map(d => getStatusIcon(d.status))}
                  </div>
                )}
              </div>

              <HandDiagram
                hand="ESQUERDA"
                isActive={maoAtual === 'ESQUERDA'}
                currentFingerIndex={dedoIndexAtivo}
                fingers={dedosEsquerda}
              />

              <div className="mt-3 flex flex-wrap gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                {filtrarDedos(dedosEsquerda).map((dedo, index) => (
                  <Button
                    key={`esquerda-${dedo.tipo}`}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMaoAtual('ESQUERDA');
                      setDedoAtual(index);
                    }}
                    className={`h-7 px-3 text-xs ${
                      maoAtual === 'ESQUERDA' && dedoAtivo?.tipo === dedo.tipo ? 'bg-accent border-primary' : ''
                    }`}
                  >
                    {getFingerLabel(dedo.tipo)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-sm text-muted-foreground text-center p-3 bg-muted/50 rounded-lg">
              {t('capture.selectHandHint')}
            </div>
          </CardContent>
        </Card>

        {/* Painel Direito: Captura de Digitais */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('capture.title')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setConfigOpen(true)} className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{t('capture.progressLabel')}</span>
                <span>{t('capture.fingersCount', { done: totalDedosCapturados, total: totalDedos })}</span>
              </div>
              <Progress value={progressoPercentual} />
            </div>

            {/* Área de pré-visualização */}
            <div className="relative aspect-[4/3] w-full bg-black rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
                {dedoAtivo?.status === 'capturing' ? t('capture.capturing') : t('capture.waiting')}
              </div>
              <div className="absolute left-2 top-2 bottom-2 w-4 bg-black/50 rounded-full p-1">
                <div
                  className="w-full bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 rounded-full transition-all"
                  style={{ height: `${dedoAtivo?.qualidade || 0}%` }}
                />
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold w-4 text-center">
                {dedoAtivo?.qualidade || 0}
              </div>
            </div>

            {/* Informações do dedo atual */}
            <div className="space-y-2">
              <div className="text-center">
                <p className="text-sm font-medium">
                  {dedoAtivo ? getFingerLabel(dedoAtivo.tipo) : ''} {maoAtual === 'DIREITA' ? t('capture.handSideRight') : t('capture.handSideLeft')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('capture.quality', { value: dedoAtivo?.qualidade || 0 })}
                </p>
              </div>

              {/* Botão de captura */}
              <Button
                onClick={simularCaptura}
                disabled={dedoAtivo?.status === 'capturing' || dedoAtivo?.status === 'captured'}
                className="w-full"
              >
                {dedoAtivo?.status === 'captured'
                  ? t('capture.buttonCaptured', { finger: dedoAtivo ? getFingerLabel(dedoAtivo.tipo) : '' })
                  : dedoAtivo?.status === 'capturing'
                    ? t('capture.capturing')
                    : t('capture.buttonCapture', { finger: dedoAtivo ? getFingerLabel(dedoAtivo.tipo) : '', hand: maoAtual === 'DIREITA' ? t('capture.handSideRight') : t('capture.handSideLeft') })
                }
              </Button>

              {/* Pular dedo */}
              <button
                type="button"
                onClick={() => {
                  const newDedos = [...dedosAtuais];
                  const dedoIndex = dedosAtuais.findIndex(d => d.tipo === dedoAtivo.tipo);
                  newDedos[dedoIndex].status = 'skipped';
                  setDedosAtuais(newDedos);
                  if (dedoAtual < dedosFiltrados.length - 1) {
                    setDedoAtual(dedoAtual + 1);
                  }
                }}
                disabled={dedoAtivo?.status === 'capturing' || dedoAtivo?.status === 'captured' || dedoAtivo?.status === 'skipped'}
                className="text-sm text-muted-foreground hover:text-foreground underline disabled:opacity-50 w-full text-center"
              >
                {t('capture.skipFinger')}
              </button>
            </div>

            {/* Navegação */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (dedoAtual > 0) {
                    setDedoAtual(dedoAtual - 1);
                    return;
                  }
                  if (maoAtual === 'ESQUERDA') {
                    const dedosDireitaFiltrados = filtrarDedos(dedosDireita);
                    setMaoAtual('DIREITA');
                    setDedoAtual(Math.max(dedosDireitaFiltrados.length - 1, 0));
                  }
                }}
                disabled={maoAtual === 'DIREITA' && dedoAtual === 0}
                className="flex-1"
              >
                {t('common.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (dedoAtual < dedosFiltrados.length - 1) {
                    setDedoAtual(dedoAtual + 1);
                    return;
                  }
                  if (maoAtual === 'DIREITA') {
                    setMaoAtual('ESQUERDA');
                    setDedoAtual(0);
                  }
                }}
                disabled={maoAtual === 'ESQUERDA' && dedoAtual === dedosFiltrados.length - 1}
                className="flex-1"
              >
                {t('common.next')}
              </Button>
            </div>

            {/* Botão finalizar */}
            <Button
              onClick={handleFinalizar}
              className="w-full h-10 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t('capture.finish')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="bg-modal-bg border-none max-w-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-title">{t('capture.settings.title')}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfigOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-title" />
                <div>
                  <Label className="text-sm font-medium">{t('capture.settings.quickTitle')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('capture.settings.quickDescription')}
                  </p>
                </div>
              </div>
              <Switch
                checked={coletaRapida}
                onCheckedChange={setColetaRapida}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <FastForward className="h-5 w-5 text-title" />
                <div>
                  <Label className="text-sm font-medium">{t('capture.settings.autoAdvanceTitle')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('capture.settings.autoAdvanceDescription')}
                  </p>
                </div>
              </div>
              <Switch
                checked={avancarAuto}
                onCheckedChange={setAvancarAuto}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                {somHabilitado ? <Volume2 className="h-5 w-5 text-title" /> : <VolumeX className="h-5 w-5 text-title" />}
                <div>
                  <Label className="text-sm font-medium">{t('capture.settings.soundTitle')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('capture.settings.soundDescription')}
                  </p>
                </div>
              </div>
              <Switch
                checked={somHabilitado}
                onCheckedChange={setSomHabilitado}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-title" />
                <div>
                  <Label className="text-sm font-medium">{t('capture.settings.manualTitle')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('capture.settings.manualDescription')}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                {t('common.open')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de finalização mesmo com erros/pêndencias */}
      <Dialog open={confirmarFinalizarOpen} onOpenChange={setConfirmarFinalizarOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('capture.confirm.title')}</DialogTitle>
            <DialogDescription>
              {hasPendencias
                ? t('capture.confirm.pendingDescription')
                : t('capture.confirm.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {t('capture.confirm.help')}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmarFinalizarOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={confirmarFinalizacao}>
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
