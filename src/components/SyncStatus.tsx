import { useSyncQueue } from '@/hooks/useSyncQueue';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function SyncStatus() {
  const { pendingCount, errorCount } = useSyncQueue();
  const { t } = useTranslation();

  if (pendingCount === 0 && errorCount === 0) {
    return (
      <Badge variant="success" className="flex items-center gap-1.5 px-3 py-1">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{t('syncStatus.synced')}</span>
      </Badge>
    );
  }

  if (errorCount > 0) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1">
        <AlertCircle className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">{t('syncStatus.errors', { count: errorCount })}</span>
      </Badge>
    );
  }

  return (
    <Badge variant="warning" className="flex items-center gap-1.5 px-3 py-1">
      <Clock className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{t('syncStatus.pending', { count: pendingCount })}</span>
    </Badge>
  );
}
