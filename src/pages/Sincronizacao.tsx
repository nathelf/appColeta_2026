import { useSync } from '@/hooks/useSync';
import { formatDateTime } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export default function Sincronizacao() {
  const { queueItems, pendingCount, errorCount, retryItem, discardItem, syncAll, syncing } = useSync();
  const { toast } = useToast();
  const { t } = useTranslation();
  const getQueueTypeLabel = (tipo: string) =>
    t(`sync.queueTypes.${tipo}`, { defaultValue: tipo });
  const getQueueStatusLabel = (status: string) =>
    t(`sync.queueStatus.${status}`, { defaultValue: status });

  const handleRetry = async (id: number) => {
    await retryItem(id);
    toast({
      title: t('sync.retryScheduledTitle'),
      description: t('sync.retryScheduledDescription')
    });
  };

  const handleRemove = async (id: number) => {
    if (confirm(t('sync.confirmRemove'))) {
      await discardItem(id);
      toast({
        title: t('sync.itemRemovedTitle'),
        description: t('sync.itemRemovedDescription')
      });
    }
  };

  const handleRetryAll = async () => {
    await syncAll();
  };

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: t('sync.title') }]} />
      
      <PageHeader
        title={t('sync.queueTitle')}
        description={t('sync.queueDescription')}
        actions={
          <Button onClick={handleRetryAll} disabled={syncing || queueItems.length === 0}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {t('sync.retryAll')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('sync.pending')}</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <Clock className="h-6 w-6 text-warning" />
              {pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('sync.withError')}</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              {errorCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('sync.totalInQueue')}</CardDescription>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              {queueItems.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('sync.itemsTitle')}</CardTitle>
          <CardDescription>
            {t('sync.itemsDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sync.table.type')}</TableHead>
                  <TableHead>{t('sync.table.status')}</TableHead>
                  <TableHead>{t('sync.table.priority')}</TableHead>
                  <TableHead>{t('sync.table.attempts')}</TableHead>
                  <TableHead>{t('sync.table.lastError')}</TableHead>
                  <TableHead>{t('sync.table.createdAt')}</TableHead>
                  <TableHead className="text-right">{t('sync.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge variant="outline">{getQueueTypeLabel(item.tipo)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'CONCLUIDO' ? 'success' :
                        item.status === 'ERRO' || item.status === 'CONFLITO' ? 'destructive' :
                        item.status === 'ENVIANDO' ? 'default' :
                        'warning'
                      }>
                        {getQueueStatusLabel(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.prioridade === 1 ? 'destructive' : 'secondary'}>
                        {item.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.tentativas}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {item.ultimoErro || '-'}
                    </TableCell>
                    <TableCell>
                      {item.createdAt ? formatDateTime(item.createdAt) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(item.status === 'ERRO' || item.status === 'CONFLITO') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRetry(item.id!)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(item.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {queueItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
                      {t('sync.empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
