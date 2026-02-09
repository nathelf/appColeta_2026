import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { routes } from '@/lib/routes';
import { FingerprintBackground } from '@/components/FingerprintBackground';
import babyColeta from '@/assets/baby_coleta.png';
import babyRecoleta from '@/assets/baby_recoleta.png';
import { useTranslation } from 'react-i18next';

export default function MenuColeta() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#e8e4dc] flex items-center justify-center p-4 relative">
      <FingerprintBackground />
      
      <div className="relative z-10 w-full max-w-5xl">
        {/* Main content grid */}
        <div className="grid md:grid-cols-2 gap-8 pt-16">
          {/* Primeira Coleta */}
          <Card 
            onClick={() => navigate(routes.coleta.primeira)}
            className="cursor-pointer hover:shadow-2xl transition-all hover:scale-105 bg-[#f5f1e8] border-0 overflow-hidden"
          >
            <CardHeader className="text-center pb-0">
              <CardTitle className="text-4xl font-bold text-primary mb-4">
                {t('menu.firstCollection')}
              </CardTitle>
            </CardHeader>
            <div className="p-6 flex justify-center">
              <div className="w-64 h-64 bg-white rounded-2xl shadow-inner flex items-center justify-center overflow-hidden">
                <img 
                  src={babyColeta} 
                  alt={t('menu.firstCollection')} 
                  className="w-full h-full object-contain p-4"
                />
              </div>
            </div>
          </Card>

          {/* Recoleta */}
          <Card 
            onClick={() => navigate(routes.coleta.recoleta)}
            className="cursor-pointer hover:shadow-2xl transition-all hover:scale-105 bg-[#f5f1e8] border-0 overflow-hidden"
          >
            <CardHeader className="text-center pb-0">
              <CardTitle className="text-4xl font-bold text-primary mb-4">
                {t('menu.recollection')}
              </CardTitle>
            </CardHeader>
            <div className="p-6 flex justify-center">
              <div className="w-64 h-64 bg-white rounded-2xl shadow-inner flex items-center justify-center overflow-hidden">
                <img 
                  src={babyRecoleta} 
                  alt={t('menu.recollection')} 
                  className="w-full h-full object-contain p-4"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
