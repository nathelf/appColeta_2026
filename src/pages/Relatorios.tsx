import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Download, TrendingUp, Users, Fingerprint } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Relatorios() {
  const { t } = useTranslation();
  return (
    <AppLayout>
      <Breadcrumb items={[{ label: t('reports.breadcrumb') }]} />
      
      <PageHeader
        title={t('reports.title')}
        description={t('reports.description')}
        actions={
          <Button>
            <Download className="h-4 w-4 mr-2" />
            {t('reports.exportCsv')}
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('reports.totalSessions')}</CardDescription>
            <CardTitle className="text-3xl font-bold">127</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="h-4 w-4 mr-1" />
              {t('reports.monthlyGrowth', { value: 12 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('reports.successRate')}</CardDescription>
            <CardTitle className="text-3xl font-bold">95%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-success">
              <TrendingUp className="h-4 w-4 mr-1" />
              {t('reports.monthlyGrowth', { value: 3 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('reports.activeUsers')}</CardDescription>
            <CardTitle className="text-3xl font-bold">8</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>{t('reports.capturedFingers')}</CardDescription>
            <CardTitle className="text-3xl font-bold">1,240</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('reports.sessionsByType')}</CardTitle>
            <CardDescription>{t('reports.last30Days')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-primary" />
                  <span className="text-sm">{t('menu.firstCollection')}</span>
                </div>
                <span className="font-medium">{t('reports.sessionsByTypeValue', { count: 78, percent: 61 })}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '61%' }} />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-accent" />
                  <span className="text-sm">{t('menu.recollection')}</span>
                </div>
                <span className="font-medium">{t('reports.sessionsByTypeValue', { count: 49, percent: 39 })}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full" style={{ width: '39%' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('reports.topOperators')}</CardTitle>
            <CardDescription>{t('reports.sessionsThisMonth')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { nome: t('reports.operators.operator'), sessoes: 45 },
                { nome: t('reports.operators.admin'), sessoes: 32 },
                { nome: t('reports.operators.supervisor'), sessoes: 28 }
              ].map((operador, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{operador.nome}</span>
                  </div>
                  <span className="font-medium">{operador.sessoes}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>{t('reports.sessionsChart')}</CardTitle>
            <CardDescription>{t('reports.last7Days')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>{t('reports.chartPlaceholder')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
