import { AppLayout } from '@/components/AppLayout';
import { Breadcrumb } from '@/components/Breadcrumb';
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';
import preColetaImg from '@/assets/baby_coleta.png';
import posColetaImg from '@/assets/baby_recoleta.png';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <AppLayout>
      <Breadcrumb items={[{ label: t('menu.dashboard') }]} />

      <PageHeader
        title={t('dashboard.title')}
        description={t('dashboard.description')}
      />

      <div className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">

        {/* Card 1 - Primeira Coleta */}
        <div
          className="group cursor-pointer rounded-3xl overflow-hidden bg-card shadow-xl hover:shadow-2xl transition-all"
          onClick={() => navigate('/coleta/primeira')}
        >
          <div className="relative h-60 w-full overflow-hidden">
            <img
              src={preColetaImg}
              alt={t('dashboard.firstCardImageAlt')}
              className="object-cover w-full h-full group-hover:scale-105 transition-all duration-500"
            />
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-2">
              {t('menu.firstCollection')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('dashboard.firstCardDescription')}
            </p>

            <button className="mt-2 bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary/90 transition">
              {t('dashboard.firstCardAction')}
            </button>
          </div>
        </div>

        {/* Card 2 - Recoleta */}
        <div
          className="group cursor-pointer rounded-3xl overflow-hidden bg-card shadow-xl hover:shadow-2xl transition-all"
          onClick={() => navigate('/coleta/recoleta')}
        >
          <div className="relative h-60 w-full overflow-hidden">
            <img
              src={posColetaImg}
              alt={t('dashboard.recollectionCardImageAlt')}
              className="object-cover w-full h-full group-hover:scale-105 transition-all duration-500"
            />
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-bold text-primary mb-2">
              {t('menu.recollection')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('dashboard.recollectionCardDescription')}
            </p>

            <button className="mt-2 bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary/90 transition">
              {t('dashboard.recollectionCardAction')}
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
