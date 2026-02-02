import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Settings, Volume2, VolumeX, X, Check, Circle, Loader2, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import babyHands from '@/assets/baby-hands-illustration.png';
import { useTranslation } from 'react-i18next';

interface PincaCaptura {
  mao: 'DIREITA' | 'ESQUERDA';
  dedo: 'POLEGAR' | 'INDICADOR';
  qualidade: number;
  frames: number;
  status: 'pending' | 'capturing' | 'captured' | 'skipped';
}

export default function CapturaPincas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [somHabilitado, setSomHabilitado] = useState(true);
  const [configOpen, setConfigOpen] = useState(false);
  const [confirmarFinalizarOpen, setConfirmarFinalizarOpen] = useState(false);
  const [hasPendencias, setHasPendencias] = useState(false);
  const [faltantes, setFaltantes] = useState<string[]>([]);
  const [maoAtual, setMaoAtual] = useState<'DIREITA' | 'ESQUERDA'>('DIREITA');
  const [dedoAtual, setDedoAtual] = useState<'POLEGAR' | 'INDICADOR'>('POLEGAR');

  const [pincas, setPincas] = useState<PincaCaptura[]>([
    { mao: 'DIREITA', dedo: 'POLEGAR', qualidade: 0, frames: 0, status: 'pending' },
    { mao: 'DIREITA', dedo: 'INDICADOR', qualidade: 0, frames: 0, status: 'pending' },
    { mao: 'ESQUERDA', dedo: 'POLEGAR', qualidade: 0, frames: 0, status: 'pending' },
    { mao: 'ESQUERDA', dedo: 'INDICADOR', qualidade: 0, frames: 0, status: 'pending' },
  ]);

  const pincaAtiva = pincas.find(p => p.mao === maoAtual && p.dedo === dedoAtual);

  const getFingerLabel = (dedo: PincaCaptura['dedo']) =>
    dedo === 'POLEGAR' ? t('capture.fingers.thumb') : t('capture.fingers.index');

  const getHandLabel = (mao: PincaCaptura['mao']) =>
    mao === 'DIREITA' ? t('capture.hands.right') : t('capture.hands.left');

  const simularCaptura = () => {
    if (!pincaAtiva) return;

    const index = pincas.findIndex(p => p.mao === maoAtual && p.dedo === dedoAtual);
    const newPincas = [...pincas];
    newPincas[index].status = 'capturing';
    setPincas(newPincas);
    
    const interval = setInterval(() => {
      setPincas(prev => {
        const updated = [...prev];
        const idx = updated.findIndex(p => p.mao === maoAtual && p.dedo === dedoAtual);
        if (updated[idx].qualidade < 100) {
          updated[idx].qualidade += 10;
          updated[idx].frames += 3;
        } else {
          clearInterval(interval);
          updated[idx].status = 'captured';
          
          toast({
            title: t('capture.toasts.capturedTitle'),
            description: t('capture.toasts.capturedDescription', {
              finger: getFingerLabel(updated[idx].dedo),
              hand: getHandLabel(maoAtual),
            })
          });
        }
        return updated;
      });
    }, 300);
  };

  const handleFinalizar = () => {
    const pendentes = pincas
      .filter((p) => p.status !== 'captured')
      .map((p) => `${getFingerLabel(p.dedo)} (${getHandLabel(p.mao)})`);

    setFaltantes(pendentes);
    setHasPendencias(pendentes.length > 0);
    setConfirmarFinalizarOpen(true);
  };

  const confirmarFinalizacao = () => {
    setConfirmarFinalizarOpen(false);
    navigate(`/coleta/sessao/${id}/formulario`, {
      state: { faltantes },
    });
  };

  const getStatusIcon = (status: PincaCaptura['status']) => {
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

  const totalPincasCapturadas = pincas.filter(p => p.status === 'captured').length;
  const totalPincas = 4;

  const pincasDireita = pincas.filter(p => p.mao === 'DIREITA');
  const pincasEsquerda = pincas.filter(p => p.mao === 'ESQUERDA');

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <Breadcrumb items={[
          { label: t('menu.collection'), href: '/coleta/primeira' },
          { label: t('capture.session'), href: `/coleta/sessao/${id}` },
          { label: t('capture.title'), href: `/coleta/sessao/${id}/captura` },
          { label: t('pincer.title') }
        ]} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/coleta/sessao/${id}/captura`)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('pincer.backToCapture')}
        </Button>
      </div>
      
      <PageHeader
        title={t('pincer.title')}
        description={t('pincer.description', { done: totalPincasCapturadas, total: totalPincas })}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Painel Esquerdo: Posição da Pinça */}
        <Card>
          <CardHeader>
          <CardTitle>{t('pincer.positionTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mão Direita */}
            <div 
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                maoAtual === 'DIREITA' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
              }`}
              onClick={() => {
                setMaoAtual('DIREITA');
                // Se o dedo atual não existe na mão direita, seleciona o primeiro disponível
                const primeiroDedo = pincasDireita.find(p => p.status !== 'captured')?.dedo || 'POLEGAR';
                setDedoAtual(primeiroDedo);
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
                    {pincasDireita.map(p => getStatusIcon(p.status))}
                  </div>
                )}
              </div>
              
              {/* Visualização da mão com apenas P e I */}
              <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-lg overflow-hidden bg-white border-2 border-border mb-4"
                style={{
                  backgroundImage: `url(${babyHands})`,
                  backgroundSize: '200% auto',
                  backgroundPosition: '0% center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
                  {/* Polegar */}
                  <g>
                    <circle
                      cx="125"
                      cy="50"
                      r="16"
                      fill={pincasDireita.find(p => p.dedo === 'POLEGAR')?.status === 'captured' ? '#22c55e' : 
                           (maoAtual === 'DIREITA' && dedoAtual === 'POLEGAR') ? '#3b82f6' : '#ffffff'}
                      stroke={(maoAtual === 'DIREITA' && dedoAtual === 'POLEGAR') ? '#2563eb' : '#9ca3af'}
                      strokeWidth={(maoAtual === 'DIREITA' && dedoAtual === 'POLEGAR') ? '3' : '2'}
                    />
                    <text x="125" y="50" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold"
                      fill={(maoAtual === 'DIREITA' && dedoAtual === 'POLEGAR') || pincasDireita.find(p => p.dedo === 'POLEGAR')?.status === 'captured' ? '#ffffff' : '#6b7280'}>
                      P
                    </text>
                    {pincasDireita.find(p => p.dedo === 'POLEGAR')?.status === 'captured' && (
                      <text x="125" y="52" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#ffffff">✓</text>
                    )}
                    <text x="125" y="75" textAnchor="middle" fontSize="9" fontWeight="700"
                      fill={(maoAtual === 'DIREITA' && dedoAtual === 'POLEGAR') ? '#2563eb' : '#6b7280'}>
                      {t('capture.fingers.thumb')}
                    </text>
                  </g>
                  
                  {/* Indicador */}
                  <g>
                    <circle
                      cx="105"
                      cy="27"
                      r="16"
                      fill={pincasDireita.find(p => p.dedo === 'INDICADOR')?.status === 'captured' ? '#22c55e' : 
                           (maoAtual === 'DIREITA' && dedoAtual === 'INDICADOR') ? '#3b82f6' : '#ffffff'}
                      stroke={(maoAtual === 'DIREITA' && dedoAtual === 'INDICADOR') ? '#2563eb' : '#9ca3af'}
                      strokeWidth={(maoAtual === 'DIREITA' && dedoAtual === 'INDICADOR') ? '3' : '2'}
                    />
                    <text x="105" y="27" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold"
                      fill={(maoAtual === 'DIREITA' && dedoAtual === 'INDICADOR') || pincasDireita.find(p => p.dedo === 'INDICADOR')?.status === 'captured' ? '#ffffff' : '#6b7280'}>
                      I
                    </text>
                    {pincasDireita.find(p => p.dedo === 'INDICADOR')?.status === 'captured' && (
                      <text x="105" y="29" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#ffffff">✓</text>
                    )}
                    <text x="105" y="52" textAnchor="middle" fontSize="9" fontWeight="700"
                      fill={(maoAtual === 'DIREITA' && dedoAtual === 'INDICADOR') ? '#2563eb' : '#6b7280'}>
                      {t('capture.fingers.index')}
                    </text>
                  </g>
                </svg>
              </div>

              <RadioGroup 
                value={maoAtual === 'DIREITA' ? dedoAtual : undefined}
                onValueChange={(value) => {
                  setDedoAtual(value as 'POLEGAR' | 'INDICADOR');
                  setMaoAtual('DIREITA');
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-4 justify-center">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="POLEGAR" id="direita-polegar" disabled={maoAtual !== 'DIREITA'} />
                    <Label htmlFor="direita-polegar" className="cursor-pointer">{t('capture.fingers.thumb')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="INDICADOR" id="direita-indicador" disabled={maoAtual !== 'DIREITA'} />
                    <Label htmlFor="direita-indicador" className="cursor-pointer">{t('capture.fingers.index')}</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Mão Esquerda */}
            <div 
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                maoAtual === 'ESQUERDA' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50'
              }`}
              onClick={() => {
                setMaoAtual('ESQUERDA');
                // Se o dedo atual não existe na mão esquerda, seleciona o primeiro disponível
                const primeiroDedo = pincasEsquerda.find(p => p.status !== 'captured')?.dedo || 'POLEGAR';
                setDedoAtual(primeiroDedo);
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
                    {pincasEsquerda.map(p => getStatusIcon(p.status))}
                  </div>
                )}
              </div>
              
              {/* Visualização da mão com apenas P e I */}
              <div className="relative w-full aspect-square max-w-[200px] mx-auto rounded-lg overflow-hidden bg-white border-2 border-border mb-4"
                style={{
                  backgroundImage: `url(${babyHands})`,
                  backgroundSize: '200% auto',
                  backgroundPosition: '96% center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full absolute inset-0">
                  {/* Polegar */}
                  <g>
                    <circle
                      cx="70"
                      cy="50"
                      r="16"
                      fill={pincasEsquerda.find(p => p.dedo === 'POLEGAR')?.status === 'captured' ? '#22c55e' : 
                           (maoAtual === 'ESQUERDA' && dedoAtual === 'POLEGAR') ? '#3b82f6' : '#ffffff'}
                      stroke={(maoAtual === 'ESQUERDA' && dedoAtual === 'POLEGAR') ? '#2563eb' : '#9ca3af'}
                      strokeWidth={(maoAtual === 'ESQUERDA' && dedoAtual === 'POLEGAR') ? '3' : '2'}
                    />
                    <text x="70" y="50" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold"
                      fill={(maoAtual === 'ESQUERDA' && dedoAtual === 'POLEGAR') || pincasEsquerda.find(p => p.dedo === 'POLEGAR')?.status === 'captured' ? '#ffffff' : '#6b7280'}>
                      P
                    </text>
                    {pincasEsquerda.find(p => p.dedo === 'POLEGAR')?.status === 'captured' && (
                      <text x="70" y="52" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#ffffff">✓</text>
                    )}
                    <text x="70" y="75" textAnchor="middle" fontSize="9" fontWeight="700"
                      fill={(maoAtual === 'ESQUERDA' && dedoAtual === 'POLEGAR') ? '#2563eb' : '#6b7280'}>
                      {t('capture.fingers.thumb')}
                    </text>
                  </g>
                  
                  {/* Indicador */}
                  <g>
                    <circle
                      cx="85"
                      cy="28"
                      r="16"
                      fill={pincasEsquerda.find(p => p.dedo === 'INDICADOR')?.status === 'captured' ? '#22c55e' : 
                           (maoAtual === 'ESQUERDA' && dedoAtual === 'INDICADOR') ? '#3b82f6' : '#ffffff'}
                      stroke={(maoAtual === 'ESQUERDA' && dedoAtual === 'INDICADOR') ? '#2563eb' : '#9ca3af'}
                      strokeWidth={(maoAtual === 'ESQUERDA' && dedoAtual === 'INDICADOR') ? '3' : '2'}
                    />
                    <text x="85" y="28" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold"
                      fill={(maoAtual === 'ESQUERDA' && dedoAtual === 'INDICADOR') || pincasEsquerda.find(p => p.dedo === 'INDICADOR')?.status === 'captured' ? '#ffffff' : '#6b7280'}>
                      I
                    </text>
                    {pincasEsquerda.find(p => p.dedo === 'INDICADOR')?.status === 'captured' && (
                      <text x="85" y="30" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#ffffff">✓</text>
                    )}
                    <text x="85" y="51" textAnchor="middle" fontSize="9" fontWeight="700"
                      fill={(maoAtual === 'ESQUERDA' && dedoAtual === 'INDICADOR') ? '#2563eb' : '#6b7280'}>
                      {t('capture.fingers.index')}
                    </text>
                  </g>
                </svg>
              </div>

              <RadioGroup 
                value={maoAtual === 'ESQUERDA' ? dedoAtual : undefined}
                onValueChange={(value) => {
                  setDedoAtual(value as 'POLEGAR' | 'INDICADOR');
                  setMaoAtual('ESQUERDA');
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex gap-4 justify-center">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="POLEGAR" id="esquerda-polegar" disabled={maoAtual !== 'ESQUERDA'} />
                    <Label htmlFor="esquerda-polegar" className="cursor-pointer">{t('capture.fingers.thumb')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="INDICADOR" id="esquerda-indicador" disabled={maoAtual !== 'ESQUERDA'} />
                    <Label htmlFor="esquerda-indicador" className="cursor-pointer">{t('capture.fingers.index')}</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="text-sm text-muted-foreground text-center p-3 bg-muted/50 rounded-lg">
              {t('pincer.hint')}
            </div>
          </CardContent>
        </Card>

        {/* Painel Direito: Captura de Pinça */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('pincer.captureTitle')}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setConfigOpen(true)} className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Área de pré-visualização */}
            <div className="relative aspect-[4/3] w-full bg-black rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">
                {pincaAtiva?.status === 'capturing' ? t('capture.capturing') : t('capture.waiting')}
              </div>
              <div className="absolute left-2 top-2 bottom-2 w-4 bg-black/50 rounded-full p-1">
                <div 
                  className="w-full bg-gradient-to-t from-red-500 via-yellow-500 to-green-500 rounded-full transition-all"
                  style={{ height: `${pincaAtiva?.qualidade || 0}%` }}
                />
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-xs font-bold w-4 text-center">
                {pincaAtiva?.qualidade || 0}
              </div>
            </div>

            {/* Informações do dedo atual */}
            <div className="space-y-2">
              <div className="text-center">
                <p className="text-sm font-medium">
                  {pincaAtiva ? getFingerLabel(pincaAtiva.dedo) : ''} {maoAtual === 'DIREITA' ? t('capture.handSideRight') : t('capture.handSideLeft')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t('capture.quality', { value: pincaAtiva?.qualidade || 0 })}
                </p>
              </div>

              {/* Botão de captura */}
              <Button
                onClick={simularCaptura}
                disabled={pincaAtiva?.status === 'capturing' || pincaAtiva?.status === 'captured'}
                className="w-full"
              >
                {pincaAtiva?.status === 'captured' 
                  ? t('capture.buttonCaptured', { finger: pincaAtiva ? getFingerLabel(pincaAtiva.dedo) : '' }) 
                  : pincaAtiva?.status === 'capturing'
                    ? t('capture.capturing')
                    : t('capture.buttonCapture', { finger: pincaAtiva ? getFingerLabel(pincaAtiva.dedo) : '', hand: maoAtual === 'DIREITA' ? t('capture.handSideRight') : t('capture.handSideLeft') })
                }
              </Button>

              {/* Pular dedo */}
              <button
                type="button"
                onClick={() => {
                  const index = pincas.findIndex(p => p.mao === maoAtual && p.dedo === dedoAtual);
                  const newPincas = [...pincas];
                  newPincas[index].status = 'skipped';
                  setPincas(newPincas);
                }}
                disabled={pincaAtiva?.status === 'capturing' || pincaAtiva?.status === 'captured' || pincaAtiva?.status === 'skipped'}
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
                  if (dedoAtual === 'INDICADOR') {
                    setDedoAtual('POLEGAR');
                  } else if (maoAtual === 'ESQUERDA') {
                    setMaoAtual('DIREITA');
                    setDedoAtual('INDICADOR');
                  } else {
                    setMaoAtual('ESQUERDA');
                    setDedoAtual('POLEGAR');
                  }
                }}
                disabled={maoAtual === 'DIREITA' && dedoAtual === 'POLEGAR'}
                className="flex-1"
              >
                {t('common.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (dedoAtual === 'POLEGAR') {
                    setDedoAtual('INDICADOR');
                  } else if (maoAtual === 'DIREITA') {
                    setMaoAtual('ESQUERDA');
                    setDedoAtual('POLEGAR');
                  }
                }}
                disabled={maoAtual === 'ESQUERDA' && dedoAtual === 'INDICADOR'}
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
              {t('pincer.finish')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Config Dialog */}
      <Dialog open={configOpen} onOpenChange={setConfigOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('capture.settings.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                {somHabilitado ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
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
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de finalização */}
      <Dialog open={confirmarFinalizarOpen} onOpenChange={setConfirmarFinalizarOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('pincer.confirm.title')}</DialogTitle>
            <DialogDescription>
              {hasPendencias
                ? t('pincer.confirm.pendingDescription')
                : t('pincer.confirm.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            {t('pincer.confirm.help')}
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

