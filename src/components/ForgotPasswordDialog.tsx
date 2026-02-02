import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('forgotPassword.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            {t('forgotPassword.description')}
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">{t('forgotPassword.supportLabel')}</p>
            <a 
              href="mailto:matheusaugustooliveira@alunos.utfpr.edu.br" 
              className="text-sm text-primary hover:underline break-all"
            >
              matheusaugustooliveira@alunos.utfpr.edu.br
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
