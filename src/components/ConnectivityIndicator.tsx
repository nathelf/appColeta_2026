import { useConnectivity } from '@/hooks/useConnectivity';
import { Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export function ConnectivityIndicator() {
  const { isOnline } = useConnectivity();
  const { t } = useTranslation();

  return (
    <Badge 
      variant={isOnline ? "success" : "warning"}
      className="flex items-center gap-1.5 px-3 py-1"
    >
      {isOnline ? (
        <>
          <Wifi className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{t('connectivity.online')}</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3.5 w-3.5" />
          <span className="text-xs font-medium">{t('connectivity.offline')}</span>
        </>
      )}
    </Badge>
  );
}
