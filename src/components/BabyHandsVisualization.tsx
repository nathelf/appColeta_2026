import React from 'react';
import babyImage from '@/assets/baby-hands-illustration.png';
import { useTranslation } from 'react-i18next';

interface Finger {
  tipo: string;
  status: 'pending' | 'capturing' | 'captured' | 'skipped';
}

interface BabyHandsVisualizationProps {
  maoAtual: 'DIREITA' | 'ESQUERDA';
  dedoAtualIndex: number; // índice global na sequência (0..9)
  dedos: Finger[]; // array com 10 itens seguindo a mesma ordem abaixo
}

type FingerPosition = {
  name: string;
  side: 'DIREITA' | 'ESQUERDA';
  top: string;
  left: string;
};

// positions are from baby's perspective (viewer left is baby's right)
const rightHandFingers: FingerPosition[] = [
  { name: 'POLEGAR', top: '55%', left: '20%', side: 'DIREITA' },
  { name: 'INDICADOR', top: '42%', left: '27%', side: 'DIREITA' },
  { name: 'MEDIO', top: '38%', left: '33%', side: 'DIREITA' },
  { name: 'ANELAR', top: '42%', left: '38%', side: 'DIREITA' },
  { name: 'MINDINHO', top: '48%', left: '42%', side: 'DIREITA' },
];

const leftHandFingers: FingerPosition[] = [
  { name: 'POLEGAR', top: '55%', left: '80%', side: 'ESQUERDA' },
  { name: 'INDICADOR', top: '42%', left: '73%', side: 'ESQUERDA' },
  { name: 'MEDIO', top: '38%', left: '67%', side: 'ESQUERDA' },
  { name: 'ANELAR', top: '42%', left: '62%', side: 'ESQUERDA' },
  { name: 'MINDINHO', top: '48%', left: '58%', side: 'ESQUERDA' },
];

// Combined order: all fingers of one hand then the other, starting by right hand (change if needed)
const combinedFingers: FingerPosition[] = [
  ...rightHandFingers,
  ...leftHandFingers
];

export function BabyHandsVisualization({ maoAtual, dedoAtualIndex, dedos }: BabyHandsVisualizationProps) {
  const { t } = useTranslation();
  // safe guard: ensure dedos length matches expected
  const normalizedDedos = dedos.length === combinedFingers.length
    ? dedos
    : [...dedos, ...Array(Math.max(0, combinedFingers.length - dedos.length)).fill({ tipo: 'UNKNOWN', status: 'pending' as const })];

  const isActiveHand = (side: 'DIREITA' | 'ESQUERDA') => maoAtual === side;

  const getFingerStatus = (index: number) => {
    if (index === dedoAtualIndex) return 'current';
    return normalizedDedos[index]?.status ?? 'pending';
  };

  const getFingerStyle = (status: string, activeHand: boolean) => {
    const baseClasses = 'absolute w-5 h-5 rounded-full transition-all duration-200 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center';
    if (!activeHand) {
      return `${baseClasses} bg-muted/30 border border-muted-foreground/20`;
    }

    switch (status) {
      case 'current':
        return `${baseClasses} bg-primary ring-4 ring-primary/50 animate-pulse scale-110`;
      case 'captured':
        return `${baseClasses} bg-green-500 border-2 border-green-600`;
      case 'capturing':
        return `${baseClasses} bg-blue-500 animate-pulse`;
      case 'skipped':
        return `${baseClasses} bg-yellow-500 border-2 border-yellow-600`;
      default:
        return `${baseClasses} bg-muted border-2 border-muted-foreground/50`;
    }
  };

  const getFingerLabel = (name: string) => {
    switch (name) {
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
        return name;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'current':
        return t('babyHands.status.current');
      case 'captured':
        return t('babyHands.status.captured');
      case 'capturing':
        return t('babyHands.status.capturing');
      case 'skipped':
        return t('babyHands.status.skipped');
      default:
        return t('babyHands.status.pending');
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto" role="region" aria-label={t('babyHands.regionLabel')}>
      {/* Baby image */}
      <img
        src={babyImage}
        alt={t('babyHands.imageAlt')}
        className="w-full h-auto rounded-md shadow-sm"
        role="img"
      />

      {/* Hand highlight overlay */}
      <div
        aria-hidden
        className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
          maoAtual === 'DIREITA'
            ? 'bg-gradient-to-r from-primary/12 via-transparent to-transparent'
            : 'bg-gradient-to-l from-primary/12 via-transparent to-transparent'
        }`}
      />

      {/* Render combined fingers with mapped index */}
      {combinedFingers.map((fingerPos, i) => {
        const status = getFingerStatus(i);
        const active = isActiveHand(fingerPos.side);
        return (
          <div
            key={`${fingerPos.side}-${fingerPos.name}-${i}`}
            className={getFingerStyle(status, active)}
            style={{ top: fingerPos.top, left: fingerPos.left }}
            title={t('babyHands.fingerTitle', {
              finger: getFingerLabel(fingerPos.name),
              hand: fingerPos.side === 'DIREITA' ? t('capture.rightHand') : t('capture.leftHand'),
              status: getStatusLabel(status),
            })}
            role="button"
            aria-pressed={status === 'current'}
            aria-label={t('babyHands.fingerAria', {
              finger: getFingerLabel(fingerPos.name),
              hand: fingerPos.side === 'DIREITA' ? t('capture.rightHand') : t('capture.leftHand'),
              status: getStatusLabel(status),
            })}
          >
            {/* small index for visual reference */}
            <span className="text-[10px] font-medium text-white select-none">{i + 1}</span>
          </div>
        );
      })}

      {/* Hand label */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-card/95 px-3 py-1 rounded-full text-sm font-medium text-title shadow-sm">
        {maoAtual === 'DIREITA' ? t('babyHands.highlightRight') : t('babyHands.highlightLeft')}
      </div>

      {/* Live region to announce current finger for screen readers */}
      <div aria-live="polite" className="sr-only">
        {t('babyHands.liveRegion', {
          finger: combinedFingers[dedoAtualIndex]?.name ? getFingerLabel(combinedFingers[dedoAtualIndex]?.name) : '—',
          hand: combinedFingers[dedoAtualIndex]?.side
            ? (combinedFingers[dedoAtualIndex]?.side === 'DIREITA' ? t('capture.rightHand') : t('capture.leftHand'))
            : '—',
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs" aria-hidden>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary ring-2 ring-primary/50" />
          <span>{t('babyHands.status.current')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>{t('babyHands.status.captured')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>{t('babyHands.status.capturing')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>{t('babyHands.status.skipped')}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-muted border border-muted-foreground/50" />
          <span>{t('babyHands.status.pending')}</span>
        </div>
      </div>
    </div>
  );
}
