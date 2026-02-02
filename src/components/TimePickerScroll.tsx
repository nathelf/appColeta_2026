import { ChevronUp, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TimePickerScrollProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimePickerScroll({ value, onChange }: TimePickerScrollProps) {
  const { t } = useTranslation();
  const [hours, minutes, seconds] = (value || '00:00:00').split(':').map(v => parseInt(v) || 0);

  const updateTime = (type: 'hours' | 'minutes' | 'seconds', delta: number) => {
    let h = hours;
    let m = minutes;
    let s = seconds;

    if (type === 'hours') {
      h = (h + delta + 24) % 24;
    } else if (type === 'minutes') {
      m = (m + delta + 60) % 60;
    } else {
      s = (s + delta + 60) % 60;
    }

    onChange(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
  };

  const formatValue = (val: number) => val.toString().padStart(2, '0');

  const TimeColumn = ({ 
    label, 
    value, 
    type,
    max 
  }: { 
    label: string; 
    value: number; 
    type: 'hours' | 'minutes' | 'seconds';
    max: number;
  }) => (
    <div className="flex flex-col items-center">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <div className="flex flex-col items-center bg-muted/50 rounded-lg p-1">
        <button
          type="button"
          onClick={() => updateTime(type, 1)}
          className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        
        <div className="text-xs text-muted-foreground">
          {formatValue((value + 1) % (max + 1))}
        </div>
        
        <div className="text-2xl font-bold text-foreground py-1 px-3 bg-background rounded my-1 min-w-[48px] text-center">
          {formatValue(value)}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {formatValue((value - 1 + max + 1) % (max + 1))}
        </div>
        
        <button
          type="button"
          onClick={() => updateTime(type, -1)}
          className="p-1 hover:bg-accent rounded text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        
        <span className="text-[10px] text-muted-foreground mt-1">{t('timePicker.scrollHint')}</span>
      </div>
    </div>
  );

  return (
    <div className="flex items-center gap-1">
      <TimeColumn label={t('timePicker.hours')} value={hours} type="hours" max={23} />
      <span className="text-xl font-bold text-muted-foreground mt-4">:</span>
      <TimeColumn label={t('timePicker.minutes')} value={minutes} type="minutes" max={59} />
      <span className="text-xl font-bold text-muted-foreground mt-4">:</span>
      <TimeColumn label={t('timePicker.seconds')} value={seconds} type="seconds" max={59} />
    </div>
  );
}
