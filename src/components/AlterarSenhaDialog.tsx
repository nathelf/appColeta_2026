import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AlterarSenhaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AlterarSenhaDialog({ open, onOpenChange }: AlterarSenhaDialogProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const handleSalvar = () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      toast({
        variant: "destructive",
        title: t('changePassword.errors.title'),
        description: t('changePassword.errors.required')
      });
      return;
    }

    if (novaSenha.length < 8) {
      toast({
        variant: "destructive",
        title: t('changePassword.errors.title'),
        description: t('changePassword.errors.minLength')
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast({
        variant: "destructive",
        title: t('changePassword.errors.title'),
        description: t('changePassword.errors.mismatch')
      });
      return;
    }

    // TODO: Validar senha atual e atualizar no banco
    toast({
      title: t('changePassword.successTitle'),
      description: t('changePassword.successDescription')
    });

    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-title text-2xl text-center">
            {t('changePassword.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="senhaAtual" className="text-foreground">
              {t('changePassword.currentPassword')}
            </Label>
            <div className="relative">
              <Input
                id="senhaAtual"
                type={showSenhaAtual ? "text" : "password"}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSenhaAtual ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="novaSenha" className="text-foreground">
              {t('changePassword.newPassword')}
            </Label>
            <div className="relative">
              <Input
                id="novaSenha"
                type={showNovaSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNovaSenha(!showNovaSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNovaSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('changePassword.minHint')}
            </p>
          </div>

          <div>
            <Label htmlFor="confirmarSenha" className="text-foreground">
              {t('changePassword.confirmPassword')}
            </Label>
            <div className="relative">
              <Input
                id="confirmarSenha"
                type={showConfirmar ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmar(!showConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSalvar}
              className="flex-1 bg-button-primary hover:bg-button-primary/90"
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
