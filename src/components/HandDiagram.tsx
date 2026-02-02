import { Check } from 'lucide-react';
import babyHands from '@/assets/baby-hands-illustration.png';
import { useTranslation } from 'react-i18next';

interface Finger {
  tipo: string;
  status: 'pending' | 'capturing' | 'captured' | 'skipped';
}

interface HandDiagramProps {
  hand: 'DIREITA' | 'ESQUERDA';
  isActive: boolean;
  currentFingerIndex: number;
  fingers: Finger[];
}

export function HandDiagram({ hand, isActive, currentFingerIndex, fingers }: HandDiagramProps) {
  const { t } = useTranslation();
  const fingerNames = ['POLEGAR', 'INDICADOR', 'MEDIO', 'ANELAR', 'MINDINHO'];
  const fingerLabels = [
    t('capture.fingerAbbrev.thumb'),
    t('capture.fingerAbbrev.index'),
    t('capture.fingerAbbrev.middle'),
    t('capture.fingerAbbrev.ring'),
    t('capture.fingerAbbrev.pinky'),
  ];
  const fingerFullNames = [
    t('capture.fingers.thumb'),
    t('capture.fingers.index'),
    t('capture.fingers.middle'),
    t('capture.fingers.ring'),
    t('capture.fingers.pinky'),
  ];
  const fingerNumbers = [1, 2, 3, 4, 5];
  
  const getFingerStatus = (index: number) => {
    const fingerType = fingerNames[index];
    const finger = fingers.find(f => f.tipo === fingerType);
    if (!finger) return 'pending';
    
    // Check if this is the current finger being selected
    const currentFinger = fingers[currentFingerIndex];
    if (currentFinger && currentFinger.tipo === fingerType && isActive) {
      return 'current';
    }
    
    return finger.status;
  };

  const getFingerStrokeColor = (status: string) => {
    switch (status) {
      case 'current':
        return '#2563eb'; // blue-600
      case 'captured':
        return '#16a34a'; // green-600
      case 'capturing':
        return '#2563eb'; // blue-600
      case 'skipped':
        return '#ca8a04'; // yellow-600
      default:
        return '#9ca3af'; // gray-400
    }
  };

  // Posições das pontas dos dedos baseadas na imagem de mão simples
  // Para mão direita: começa pelo mindinho (esquerda) até polegar (direita)
  // Para mão esquerda: começa pelo polegar (esquerda) até mindinho (direita)
  // Coordenadas ajustadas para ficarem mais próximas das pontas dos dedos
  const positionsRightHand = [
    { x: 50, y: 55 },   // Mindinho (5) - lado esquerdo
    { x: 65, y: 32 },   // Anelar (4)
    { x: 85, y: 22 },   // Médio (3)
    { x: 105, y: 27 },  // Indicador (2)
    { x: 125, y: 50 },  // Polegar (1) - lado direito
  ];
  
  const positionsLeftHand = [
    { x: 70, y: 50 },   // Polegar (1) - lado esquerdo
    { x: 85, y: 28 },   // Indicador (2)
    { x: 105, y: 18 },  // Médio (3)
    { x: 125, y: 23 },  // Anelar (4)
    { x: 145, y: 45 },  // Mindinho (5) - lado direito
  ];
  
  // Mapear índices: fingerNames = [POLEGAR(0), INDICADOR(1), MEDIO(2), ANELAR(3), MINDINHO(4)]
  // Para mão direita: inverter ordem -> [MINDINHO(4), ANELAR(3), MEDIO(2), INDICADOR(1), POLEGAR(0)]
  // Para mão esquerda: ordem normal -> [POLEGAR(0), INDICADOR(1), MEDIO(2), ANELAR(3), MINDINHO(4)]
  const getFingerPosition = (index: number) => {
    if (hand === 'DIREITA') {
      // Inverter: índice 0 (POLEGAR) -> posição 4, índice 4 (MINDINHO) -> posição 0
      const invertedIndex = 4 - index;
      return positionsRightHand[invertedIndex];
    } else {
      return positionsLeftHand[index];
    }
  };

  return (
    <div className={`relative p-2 rounded-lg border-2 transition-all ${
      isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'
    }`}>
      <h4 className={`text-center text-xs font-medium mb-2 ${
        isActive ? 'text-primary' : 'text-muted-foreground'
      }`}>
        {hand === 'DIREITA' ? t('capture.rightHand') : t('capture.leftHand')}
      </h4>
      
      {/* Hand diagram area - usando apenas a imagem de fundo */}
      <div
        className="relative w-full aspect-square max-w-[200px] mx-auto rounded-lg overflow-hidden bg-white"
        style={{
          backgroundImage: `url(${babyHands})`,
          backgroundSize: '200% auto',
          backgroundPosition: hand === 'DIREITA' ? '0% center' : '96% center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay SVG apenas para os indicadores de status */}
        <svg 
          viewBox="0 0 200 200" 
          className="w-full h-full absolute inset-0"
        >
          {/* Indicadores nas pontas dos dedos */}
          {fingerNames.map((fingerName, index) => {
            const status = getFingerStatus(index);
            const isCurrent = status === 'current';
            const strokeColor = getFingerStrokeColor(status);
            const tipPos = getFingerPosition(index);
            
            return (
              <g key={fingerName}>
                {/* Círculo indicador na ponta do dedo */}
                <circle
                  cx={tipPos.x}
                  cy={tipPos.y}
                  r="16"
                  fill={status === 'captured' ? '#22c55e' : status === 'current' ? '#3b82f6' : status === 'skipped' ? '#eab308' : '#ffffff'}
                  stroke={strokeColor}
                  strokeWidth={isCurrent ? '3' : '2'}
                  className={isCurrent ? 'ring-2 ring-primary/30' : ''}
                  opacity={status === 'pending' ? 0.6 : 1}
                />
                {/* Número do dedo */}
                <text
                  x={tipPos.x}
                  y={tipPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="bold"
                  fill={status === 'captured' || status === 'current' || status === 'skipped' ? '#ffffff' : '#6b7280'}
                >
                  {fingerNumbers[index]}
                </text>
                {/* Ícone de status */}
                {status === 'captured' && (
                  <text
                    x={tipPos.x}
                    y={tipPos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fill="#ffffff"
                  >
                    ✓
                  </text>
                )}
                {status === 'skipped' && (
                  <text
                    x={tipPos.x}
                    y={tipPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fill="#ffffff"
                  >
                    ✕
                  </text>
                )}
                
                {/* Label abaixo da ponta do dedo */}
                <text
                  x={tipPos.x}
                  y={tipPos.y + 25}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="700"
                  fill={isCurrent ? '#2563eb' : '#6b7280'}
                >
                  {fingerLabels[index]}
                </text>
                <text
                  x={tipPos.x}
                  y={tipPos.y + 35}
                  textAnchor="middle"
                  fontSize="7"
                  fill="#9ca3af"
                >
                  {fingerFullNames[index]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
