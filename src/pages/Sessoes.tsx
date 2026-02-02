import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Sessoes() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const getSessionTypeLabel = (tipo?: string) =>
    tipo ? t(`sessionTypes.${tipo}`, { defaultValue: tipo }) : '-';

  const sessoes = useLiveQuery(
    () => db.sessoesColeta.orderBy('dataInicio').reverse().toArray()
  );

  const filteredSessoes = sessoes?.filter(s => 
    s.uuid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: t('sessions.breadcrumb') }]} />
      
      <PageHeader
        title={t('sessions.title')}
        description={t('sessions.description')}
        actions={
          <Button onClick={() => navigate('/coleta/primeira')}>
            {t('sessions.new')}
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('sessions.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sessions.table.id')}</TableHead>
                  <TableHead>{t('sessions.table.type')}</TableHead>
                  <TableHead>{t('sessions.table.status')}</TableHead>
                  <TableHead>{t('sessions.table.startDate')}</TableHead>
                  <TableHead>{t('sessions.table.endDate')}</TableHead>
                  <TableHead>{t('sessions.table.sync')}</TableHead>
                  <TableHead className="text-right">{t('sessions.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessoes?.map((sessao) => (
                  <TableRow key={sessao.id}>
                    <TableCell className="font-mono text-sm">
                      #{sessao.id}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getSessionTypeLabel(sessao.tipoSessao)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        sessao.status === 'CONCLUIDA' ? 'success' :
                        sessao.status === 'EM_ANDAMENTO' ? 'default' :
                        'destructive'
                      }>
                        {t(`sessions.status.${sessao.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDateTime(sessao.dataInicio)}
                    </TableCell>
                    <TableCell>
                      {sessao.dataFim ? formatDateTime(sessao.dataFim) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        sessao.syncStatus === 'SINCRONIZADO' ? 'success' :
                        sessao.syncStatus === 'ERRO' ? 'destructive' :
                        'warning'
                      }>
                        {sessao.syncStatus ? t(`sessions.sync.${sessao.syncStatus}`) : t('sessions.sync.PENDENTE')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/coleta/sessao/${sessao.id}/conclusao`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('sessions.details')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredSessoes || filteredSessoes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t('sessions.empty')}
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
