import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/utils';
import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Auditoria() {
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  const auditorias = useLiveQuery(
    () => db.auditorias.orderBy('createdAt').reverse().toArray()
  );

  const filteredAuditorias = auditorias?.filter(a => 
    a.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.entidade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: t('audit.breadcrumb') }]} />
      
      <PageHeader
        title={t('audit.title')}
        description={t('audit.description')}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('audit.searchPlaceholder')}
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
                  <TableHead>{t('audit.table.dateTime')}</TableHead>
                  <TableHead>{t('audit.table.action')}</TableHead>
                  <TableHead>{t('audit.table.entity')}</TableHead>
                  <TableHead>{t('audit.table.user')}</TableHead>
                  <TableHead>{t('audit.table.device')}</TableHead>
                  <TableHead>{t('audit.table.ip')}</TableHead>
                  <TableHead>{t('audit.table.sync')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuditorias?.map((auditoria) => (
                  <TableRow key={auditoria.id}>
                    <TableCell>
                      {auditoria.createdAt ? formatDateTime(auditoria.createdAt) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        auditoria.acao === 'CRIAR' ? 'default' :
                        auditoria.acao === 'ATUALIZAR' ? 'secondary' :
                        'destructive'
                      }>
                        {t(`audit.actions.${auditoria.acao}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{auditoria.entidade}</TableCell>
                    <TableCell>#{auditoria.usuarioId}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {auditoria.dispositivo || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {auditoria.ipAddress || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        auditoria.syncStatus === 'SINCRONIZADO' ? 'success' :
                        auditoria.syncStatus === 'ERRO' ? 'destructive' :
                        'warning'
                      }>
                        {auditoria.syncStatus ? t(`audit.syncStatus.${auditoria.syncStatus}`) : t('audit.syncStatus.PENDENTE')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredAuditorias || filteredAuditorias.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t('audit.empty')}
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
