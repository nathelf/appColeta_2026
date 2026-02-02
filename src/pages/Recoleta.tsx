import { useMemo, useState, useEffect, useRef } from 'react';
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
import { formatDate, dateDDMMYYYYToISO, dateISOToDDMMYYYY } from '@/lib/utils';
import { getAuthUser } from '@/lib/auth';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Recoleta() {
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [nomeMae, setNomeMae] = useState('');
  const [dataNascimentoBebe, setDataNascimentoBebe] = useState('');
  const [bebeId, setBebeId] = useState('');
  const [scannerId, setScannerId] = useState('');
  const [maeIdSelecionada, setMaeIdSelecionada] = useState('');
  const [maeEncontrada, setMaeEncontrada] = useState<any>(null);
  const [maesResultado, setMaesResultado] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  
  // Estados para autocomplete
  const [nomeMaeResults, setNomeMaeResults] = useState<any[]>([]);
  const [cpfResults, setCpfResults] = useState<any[]>([]);
  const [rgResults, setRgResults] = useState<any[]>([]);
  const [dataBebeResults, setDataBebeResults] = useState<any[]>([]);
  const [showNomeMaeDropdown, setShowNomeMaeDropdown] = useState(false);
  const [showCpfDropdown, setShowCpfDropdown] = useState(false);
  const [showRgDropdown, setShowRgDropdown] = useState(false);
  const [showDataBebeDropdown, setShowDataBebeDropdown] = useState(false);
  
  const nomeMaeRef = useRef<HTMLDivElement>(null);
  const cpfRef = useRef<HTMLDivElement>(null);
  const rgRef = useRef<HTMLDivElement>(null);
  const dataBebeRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = getAuthUser();
  const { t } = useTranslation();

  const scanners = useLiveQuery(() => db.scanners.toArray().then(s => s.filter(scanner => scanner.ativo)));

  const bebes = useLiveQuery(
    () => {
      if (!maeEncontrada?.id) return Promise.resolve([]);
      return db.bebes.where('maeId').equals(maeEncontrada.id).toArray();
    },
    [maeEncontrada]
  );

  // Busca em tempo real por nome
  useEffect(() => {
    if (nomeMae.trim().length >= 2) {
      const buscarNome = async () => {
        const maes = await db.maes.toArray();
        const resultadosFiltrados = maes.filter(m => 
          m.nome?.toLowerCase().includes(nomeMae.toLowerCase())
        );
        
        // Remover duplicatas baseado no nome completo normalizado
        const nomesUnicos = new Map<string, any>();
        resultadosFiltrados.forEach(mae => {
          if (mae.nome) {
            const nomeNormalizado = mae.nome.toLowerCase().replace(/\s+/g, ' ').trim();
            if (!nomesUnicos.has(nomeNormalizado)) {
              nomesUnicos.set(nomeNormalizado, mae);
            }
          }
        });
        
        const resultados = Array.from(nomesUnicos.values()).slice(0, 5);
        setNomeMaeResults(resultados);
        setShowNomeMaeDropdown(true);
      };
      buscarNome();
    } else {
      setNomeMaeResults([]);
      setShowNomeMaeDropdown(false);
    }
  }, [nomeMae]);

  // Busca em tempo real por CPF
  useEffect(() => {
    const cpfNumeros = cpf.replace(/\D/g, '');
    if (cpfNumeros.length >= 3) {
      const buscarCpf = async () => {
        const maes = await db.maes.toArray();
        const resultados = maes
          .filter(m => m.cpf?.includes(cpfNumeros))
          .slice(0, 5);
        setCpfResults(resultados);
        setShowCpfDropdown(true);
      };
      buscarCpf();
    } else {
      setCpfResults([]);
      setShowCpfDropdown(false);
    }
  }, [cpf]);

  // Busca em tempo real por RG
  useEffect(() => {
    if (rg.trim().length >= 2) {
      const buscarRg = async () => {
        const maes = await db.maes.toArray();
        const resultados = maes
          .filter(m => m.rg?.toLowerCase().includes(rg.toLowerCase()))
          .slice(0, 5);
        setRgResults(resultados);
        setShowRgDropdown(true);
      };
      buscarRg();
    } else {
      setRgResults([]);
      setShowRgDropdown(false);
    }
  }, [rg]);

  // Busca em tempo real por data do bebê
  useEffect(() => {
    if (dataNascimentoBebe && dataNascimentoBebe.length === 10) {
      const dataISO = dateDDMMYYYYToISO(dataNascimentoBebe);
      if (dataISO) {
        const buscarData = async () => {
          const maes = await db.maes.toArray();
          const resultados: any[] = [];
          for (const mae of maes) {
            const bebesMae = await db.bebes.where('maeId').equals(mae.id!).toArray();
            const temBebeNaData = bebesMae.some((b) => {
              const dataIso = new Date(b.dataNascimento).toISOString().slice(0, 10);
              return dataIso === dataISO;
            });
            if (temBebeNaData) {
              resultados.push(mae);
            }
          }
          setDataBebeResults(resultados.slice(0, 5));
          setShowDataBebeDropdown(true);
        };
        buscarData();
      } else {
        setDataBebeResults([]);
        setShowDataBebeDropdown(false);
      }
    } else {
      setDataBebeResults([]);
      setShowDataBebeDropdown(false);
    }
  }, [dataNascimentoBebe]);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (nomeMaeRef.current && !nomeMaeRef.current.contains(event.target as Node)) {
        setShowNomeMaeDropdown(false);
      }
      if (cpfRef.current && !cpfRef.current.contains(event.target as Node)) {
        setShowCpfDropdown(false);
      }
      if (rgRef.current && !rgRef.current.contains(event.target as Node)) {
        setShowRgDropdown(false);
      }
      if (dataBebeRef.current && !dataBebeRef.current.contains(event.target as Node)) {
        setShowDataBebeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBuscar = async () => {
    const cpfNumeros = cpf.replace(/\D/g, '');
    if (cpfNumeros && cpfNumeros.length === 11 && !validateCPF(cpfNumeros)) {
      toast({
        title: t('recollection.errors.invalidCpfTitle'),
        description: t('recollection.errors.invalidCpfDescription'),
        variant: 'destructive',
      });
      return;
    }

    setSearching(true);
    setMaeEncontrada(null);
    setMaesResultado([]);
    setMaeIdSelecionada('');
    setBebeId('');

    try {
      const maes = await db.maes.toArray();

      const filtrados = maes.filter((mae) => {
        const nomeOk = nomeMae.trim()
          ? mae.nome?.toLowerCase().includes(nomeMae.trim().toLowerCase())
          : true;

        const cpfOk = cpfNumeros
          ? mae.cpf === cpfNumeros
          : true;

        const rgOk = rg.trim()
          ? mae.rg?.toLowerCase().includes(rg.trim().toLowerCase())
          : true;

        return nomeOk && cpfOk && rgOk;
      });

      // Se filtrar por data de nascimento do bebê, restringir aqui
      let filtradosComData = filtrados;
      if (dataNascimentoBebe && dataNascimentoBebe.length === 10) {
        const dataISO = dateDDMMYYYYToISO(dataNascimentoBebe);
        if (dataISO) {
          filtradosComData = [];
          for (const mae of filtrados) {
            const bebesMae = await db.bebes.where('maeId').equals(mae.id!).toArray();
            const temBebeNaData = bebesMae.some((b) => {
              const dataIso = new Date(b.dataNascimento).toISOString().slice(0, 10);
              return dataIso === dataISO;
            });
            if (temBebeNaData) {
              filtradosComData.push(mae);
            }
          }
        }
      }

      if (!filtradosComData.length) {
        toast({
          title: t('recollection.errors.notFoundTitle'),
          description: t('recollection.errors.notFoundDescription'),
          variant: 'destructive',
        });
        return;
      }

      // Remover duplicatas baseado no nome completo normalizado
      const nomesUnicos = new Map<string, any>();
      filtradosComData.forEach(mae => {
        if (mae.nome) {
          const nomeNormalizado = mae.nome.toLowerCase().replace(/\s+/g, ' ').trim();
          if (!nomesUnicos.has(nomeNormalizado)) {
            nomesUnicos.set(nomeNormalizado, mae);
          }
        }
      });
      const resultadosUnicos = Array.from(nomesUnicos.values());

      setMaesResultado(resultadosUnicos);
      // auto-seleciona se houver um único resultado
      if (resultadosUnicos.length === 1) {
        setMaeEncontrada(resultadosUnicos[0]);
        setMaeIdSelecionada(resultadosUnicos[0].id!.toString());
        toast({
          title: t('recollection.results.singleTitle'),
          description: t('recollection.results.singleDescription', { name: resultadosUnicos[0].nome }),
        });
      } else {
        toast({
          title: t('recollection.results.multipleTitle'),
          description: t('recollection.results.multipleDescription', { count: resultadosUnicos.length }),
        });
      }
    } catch (error) {
      toast({
        title: t('recollection.errors.searchTitle'),
        description: t('recollection.errors.searchDescription'),
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  const handleIniciar = async () => {
    if (!bebeId || !scannerId) {
      toast({
        title: t('recollection.errors.requiredTitle'),
        description: t('recollection.errors.requiredDescription'),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const sessaoId = await db.sessoesColeta.add({
        usuarioId: user!.id,
        maeId: maeEncontrada!.id!,
        bebeId: parseInt(bebeId),
        scannerId: parseInt(scannerId),
        tipoSessao: 'RECOLETA',
        matchingHabilitado: false,
        dataInicio: new Date(),
        status: 'EM_ANDAMENTO',
        syncStatus: 'PENDENTE',
        createdAt: new Date()
      });

      toast({
        title: t('recollection.sessionStartedTitle'),
        description: t('recollection.sessionStartedDescription'),
      });

      navigate(`/coleta/sessao/${sessaoId}/captura`);
    } catch (error) {
      toast({
        title: t('recollection.errors.startTitle'),
        description: t('recollection.errors.startDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader 
        title={t('menu.recollection')}
        description={t('recollection.description')}
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{t('recollection.searchTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5 relative" ref={nomeMaeRef}>
              <Label htmlFor="nomeMae">{t('recollection.fields.motherName')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nomeMae"
                  value={nomeMae}
                  onChange={(e) => setNomeMae(e.target.value)}
                  onFocus={() => nomeMae.trim().length >= 2 && setShowNomeMaeDropdown(true)}
                  placeholder={t('recollection.fields.motherNamePlaceholder')}
                  className="pl-9"
                />
                {showNomeMaeDropdown && nomeMaeResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                    {nomeMaeResults.map((mae) => (
                      <div
                        key={mae.id}
                        className="px-4 py-2 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setNomeMae(mae.nome || '');
                          setShowNomeMaeDropdown(false);
                        }}
                      >
                        <div className="font-medium">{mae.nome}</div>
                        {mae.cpf && <div className="text-xs text-muted-foreground">{t('recollection.fields.cpfValue', { value: formatCPF(mae.cpf) })}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5 relative" ref={cpfRef}>
              <Label htmlFor="cpfMae">{t('recollection.fields.cpfLabel')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cpfMae"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  onFocus={() => cpf.replace(/\D/g, '').length >= 3 && setShowCpfDropdown(true)}
                  placeholder={t('recollection.fields.cpfPlaceholder')}
                  className="pl-9"
                />
                {showCpfDropdown && cpfResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                    {cpfResults.map((mae) => (
                      <div
                        key={mae.id}
                        className="px-4 py-2 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setCpf(mae.cpf ? formatCPF(mae.cpf) : '');
                          setShowCpfDropdown(false);
                        }}
                      >
                        <div className="font-medium">{mae.nome}</div>
                        <div className="text-xs text-muted-foreground">{t('recollection.fields.cpfValue', { value: mae.cpf ? formatCPF(mae.cpf) : '' })}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5 relative" ref={rgRef}>
              <Label htmlFor="rgMae">{t('recollection.fields.rgLabel')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="rgMae"
                  value={rg}
                  onChange={(e) => setRg(e.target.value)}
                  onFocus={() => rg.trim().length >= 2 && setShowRgDropdown(true)}
                  placeholder={t('recollection.fields.rgPlaceholder')}
                  className="pl-9"
                />
                {showRgDropdown && rgResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                    {rgResults.map((mae) => (
                      <div
                        key={mae.id}
                        className="px-4 py-2 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setRg(mae.rg || '');
                          setShowRgDropdown(false);
                        }}
                      >
                        <div className="font-medium">{mae.nome}</div>
                        <div className="text-xs text-muted-foreground">{t('recollection.fields.rgValue', { value: mae.rg })}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5 relative" ref={dataBebeRef}>
              <Label htmlFor="dataNascimentoBebe">{t('recollection.fields.babyDateLabel')}</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dataNascimentoBebe"
                  type="date"
                  value={dataNascimentoBebe}
                  onChange={(e) => setDataNascimentoBebe(e.target.value)}
                  onFocus={() => dataNascimentoBebe && dataNascimentoBebe.length === 10 && setShowDataBebeDropdown(true)}
                  placeholder={t('recollection.fields.babyDatePlaceholder')}
                  className="pl-9"
                />
                {showDataBebeDropdown && dataBebeResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                    {dataBebeResults.map((mae) => (
                      <div
                        key={mae.id}
                        className="px-4 py-2 hover:bg-accent cursor-pointer"
                        onClick={() => {
                          setShowDataBebeDropdown(false);
                        }}
                      >
                        <div className="font-medium">{mae.nome}</div>
                        {mae.cpf && <div className="text-xs text-muted-foreground">{t('recollection.fields.cpfValue', { value: formatCPF(mae.cpf) })}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleBuscar} disabled={searching}>
              {searching ? t('recollection.searching') : t('common.search')}
            </Button>
          </div>

          {maesResultado.length > 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="maeSelect">{t('recollection.selectRecordLabel')}</Label>
                <Select
                  value={maeIdSelecionada}
                  onValueChange={(value) => {
                    setMaeIdSelecionada(value);
                    const maeSel = maesResultado.find((m) => m.id?.toString() === value);
                    setMaeEncontrada(maeSel || null);
                    setBebeId('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('recollection.selectRecordPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {maesResultado.map((mae) => (
                      <SelectItem key={mae.id} value={mae.id!.toString()}>
                        {mae.nome} {mae.cpf ? `• CPF ${formatCPF(mae.cpf)}` : ''} {mae.rg ? `• RG ${mae.rg}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {maeEncontrada && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold">{t('recollection.selectedMotherTitle')}</p>
                  <p className="text-sm">{maeEncontrada.nome}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bebe">{t('recollection.selectBabyLabel')}</Label>
                <Select value={bebeId} onValueChange={setBebeId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('recollection.selectBabyPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {bebes?.map((bebe) => (
                      <SelectItem key={bebe.id} value={bebe.id!.toString()}>
                        {t('recollection.babyBirthValue', { value: formatDate(bebe.dataNascimento) })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scanner">{t('recollection.selectScannerLabel')}</Label>
                <Select value={scannerId} onValueChange={setScannerId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('recollection.selectScannerPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {scanners?.map((scanner) => (
                      <SelectItem key={scanner.id} value={scanner.id!.toString()}>
                        {scanner.nome} - {scanner.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleIniciar} 
                  disabled={!bebeId || !scannerId || loading}
                  className="w-full"
                >
                  {loading ? t('recollection.starting') : t('recollection.startAction')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  );
}
