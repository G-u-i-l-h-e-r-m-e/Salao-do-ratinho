import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface TermsDialogProps {
  open: boolean;
  onAccept: () => void;
}

export function TermsDialog({ open, onAccept }: TermsDialogProps) {
  const [showFullTerms, setShowFullTerms] = useState(false);

  if (showFullTerms) {
    return (
      <AlertDialog open={open}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>Termos de Uso</AlertDialogTitle>
          </AlertDialogHeader>
          <ScrollArea className="h-[50vh] pr-4">
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground space-y-4">
                {/* PLACEHOLDER - Substitua pelo conteúdo dos termos de uso */}
                <p>
                  <strong>1. Aceitação dos Termos</strong>
                </p>
                <p>
                  Ao acessar e usar este aplicativo, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.
                </p>
                <p>
                  <strong>2. Uso do Serviço</strong>
                </p>
                <p>
                  O serviço é destinado ao gerenciamento de agendamentos e administração de salões de beleza. Você concorda em usar o serviço apenas para fins legais e de acordo com estes termos.
                </p>
                <p>
                  <strong>3. Conta do Usuário</strong>
                </p>
                <p>
                  Você é responsável por manter a confidencialidade de sua conta e senha. Você concorda em aceitar responsabilidade por todas as atividades que ocorram em sua conta.
                </p>
                <p>
                  <strong>4. Modificações</strong>
                </p>
                <p>
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. As modificações entram em vigor imediatamente após sua publicação.
                </p>
                {/* FIM DO PLACEHOLDER */}
              </div>
            </AlertDialogDescription>
          </ScrollArea>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowFullTerms(false)}>
              Voltar
            </Button>
            <AlertDialogAction onClick={onAccept}>
              Li e Concordo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Termos de Uso</AlertDialogTitle>
          <AlertDialogDescription>
            Para continuar, você precisa aceitar nossos Termos de Uso. Deseja visualizar os termos completos?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFullTerms(true)}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Termos
          </Button>
          <AlertDialogAction onClick={onAccept}>
            Concordo com os Termos
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
