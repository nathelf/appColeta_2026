import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { formatCPF, validateCPF } from '@/lib/cpf';
import { useTranslation } from 'react-i18next';

export default function PrimeiraColeta() {
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [scannerId, setScannerId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const scanners = useLiveQuery(() => db.scanners.toArray().then(s => s.filter(scanner => scanner.ativo)));

  // Pre-select the first scanner when available
  useEffect(() => {
    if (scanners && scanners.length > 0 && !scannerId) {
      setScannerId(scanners[0].id!.toString());
    }
  }, [scanners, scannerId]);

  const handleCpfChange = (value: string) => {
    setCpf(formatCPF(value));
  };

  const handleContinuar = async () => {
    if (!nomeMae.trim()) {
      toast({
        title: t('collection.mother.errors.requiredTitle'),
        description: t('collection.mother.errors.requiredDescription'),
        variant: 'destructive',
      });
      return;
    }

    // Validar se tem sobrenome (pelo menos 2 palavras)
    const nomePartes = nomeMae.trim().split(/\s+/).filter(p => p.length > 0);
    if (nomePartes.length < 2) {
      toast({
        title: t('collection.mother.errors.lastNameTitle'),
        description: t('collection.mother.errors.lastNameDescription'),
        variant: 'destructive',
      });
      return;
    }

    if (cpf && !validateCPF(cpf)) {
      toast({
        title: t('collection.mother.errors.invalidCpfTitle'),
        description: t('collection.mother.errors.invalidCpfDescription'),
        variant: 'destructive',
      });
      return;
    }

    if (!scannerId) {
      toast({
        title: t('collection.scanner.errors.missingTitle'),
        description: t('collection.scanner.errors.missingDescription'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const cpfNumeros = cpf.replace(/\D/g, '');
      let mae;
      
      if (cpfNumeros) {
        mae = await db.maes.where('cpf').equals(cpfNumeros).first();
      }

      if (!mae) {
        // Verificar duplicidade de nome completo (case-insensitive, normalizado)
        const nomeNormalizado = nomeMae.trim().toLowerCase().replace(/\s+/g, ' ');
        const todasMaes = await db.maes.toArray();
        const nomeDuplicado = todasMaes.find(m => 
          m.nome?.toLowerCase().replace(/\s+/g, ' ') === nomeNormalizado
        );

        if (nomeDuplicado) {
          toast({
            title: t('collection.mother.errors.duplicateTitle'),
            description: t('collection.mother.errors.duplicateDescription', { name: nomeDuplicado.nome }),
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const maeId = await db.maes.add({
          nome: nomeMae.trim(),
          cpf: cpfNumeros || undefined,
          rg: rg || undefined,
          createdAt: new Date()
        });
        mae = await db.maes.get(maeId);
      }

      sessionStorage.setItem('mae_id', mae!.id!.toString());
      sessionStorage.setItem('scanner_id', scannerId);

      toast({
        title: t('collection.mother.savedTitle'),
        description: t('collection.mother.savedDescription'),
      });

      navigate('/coleta/cadastro-bebe');
    } catch (error) {
      toast({
        title: t('collection.errors.saveTitle'),
        description: t('collection.errors.saveDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = nomeMae.trim().length > 0 && scannerId;

  return (
    <AppLayout>
      <PageHeader 
        title={t('collection.first.title')}
        description={t('collection.first.description')}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('collection.mother.sectionTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">{t('collection.mother.cpfLabel')}</Label>
              <Input
                id="cpf"
                value={cpf}
                onChange={(e) => handleCpfChange(e.target.value)}
                placeholder={t('collection.mother.cpfPlaceholder')}
                maxLength={14}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rg">{t('collection.mother.rgLabel')}</Label>
              <Input
                id="rg"
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder={t('collection.mother.rgPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeMae">{t('collection.mother.fullNameLabel')}</Label>
            <Input
              id="nomeMae"
              value={nomeMae}
              onChange={(e) => setNomeMae(e.target.value)}
              placeholder={t('collection.mother.fullNamePlaceholder')}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl mt-4">
        <CardHeader>
          <CardTitle>{t('collection.scanner.sectionTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scanner">{t('collection.scanner.label')}</Label>
            <Select value={scannerId} onValueChange={setScannerId}>
              <SelectTrigger>
                <SelectValue placeholder={t('collection.scanner.placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {scanners?.map((scanner) => (
                  <SelectItem key={scanner.id} value={scanner.id!.toString()}>
                    {scanner.nome} - {scanner.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {scanners && scanners.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('collection.scanner.empty')}</p>
            )}
          </div>

          <div className="pt-4">
            <Button 
              onClick={handleContinuar} 
              disabled={!isFormValid || loading}
              className="w-full"
            >
              {loading ? t('common.processing') : t('common.continue')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
