import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { setTermoAceito, getAuthUser } from '@/lib/auth';
import { FingerprintBackground } from '@/components/FingerprintBackground';
import { useTranslation } from 'react-i18next';

export default function TermoDeUso() {
  const [accepted, setAccepted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleAccept = () => {
    if (!accepted) {
      toast({
        title: t('terms.errors.notAcceptedTitle'),
        description: t('terms.errors.notAcceptedDescription'),
        variant: 'destructive',
      });
      return;
    }

    setTermoAceito('1.0');
    toast({
      title: t('terms.acceptedTitle'),
      description: t('terms.acceptedDescription'),
    });
    navigate('/dashboard');
  };

  const handleReject = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#e8e4dc] flex items-center justify-center p-4 relative">
      <FingerprintBackground />
      
      <Card className="w-full max-w-3xl bg-modal/95 backdrop-blur-sm border-0 shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">{t('terms.title')}</CardTitle>
          <p className="text-card-foreground/80 mt-2">{t('terms.version')}</p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full rounded border p-4 bg-background/50">
            <div className="space-y-4 text-sm text-foreground">
              <p className="font-semibold">{t('terms.sections.object.title')}</p>
              <p>{t('terms.sections.object.body')}</p>
              
              <p className="font-semibold">{t('terms.sections.confidentiality.title')}</p>
              <p>{t('terms.sections.confidentiality.body')}</p>
              
              <p className="font-semibold">{t('terms.sections.responsibilities.title')}</p>
              <p>{t('terms.sections.responsibilities.intro')}</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>{t('terms.sections.responsibilities.items.0')}</li>
                <li>{t('terms.sections.responsibilities.items.1')}</li>
                <li>{t('terms.sections.responsibilities.items.2')}</li>
                <li>{t('terms.sections.responsibilities.items.3')}</li>
              </ul>
              
              <p className="font-semibold">{t('terms.sections.lgpd.title')}</p>
              <p>{t('terms.sections.lgpd.body')}</p>
              
              <p className="font-semibold">{t('terms.sections.audit.title')}</p>
              <p>{t('terms.sections.audit.body')}</p>
              
              <p className="font-semibold">{t('terms.sections.penalties.title')}</p>
              <p>{t('terms.sections.penalties.body')}</p>
              
              <p className="font-semibold">{t('terms.sections.validity.title')}</p>
              <p>{t('terms.sections.validity.body')}</p>
            </div>
          </ScrollArea>

          <div className="flex items-center space-x-2 mt-4 p-3 rounded bg-background/30">
            <Checkbox id="accept" checked={accepted} onCheckedChange={(checked) => setAccepted(checked as boolean)} />
            <label htmlFor="accept" className="text-sm cursor-pointer text-card-foreground/90 font-medium">
              {t('terms.acceptLabel')}
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleReject} 
            className="flex-1 h-11 font-bold"
          >
            {t('menu.logout')}
          </Button>
          <Button 
            onClick={handleAccept} 
            disabled={!accepted} 
            className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            {t('terms.acceptButton')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
