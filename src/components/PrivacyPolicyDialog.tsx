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

interface PrivacyPolicyDialogProps {
  open: boolean;
  onAccept: () => void;
}

export function PrivacyPolicyDialog({ open, onAccept }: PrivacyPolicyDialogProps) {
  const [showFullPolicy, setShowFullPolicy] = useState(false);

  if (showFullPolicy) {
    return (
      <AlertDialog open={open}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh]">
          <AlertDialogHeader>
            <AlertDialogTitle>Política de Privacidade</AlertDialogTitle>
          </AlertDialogHeader>
          <ScrollArea className="h-[50vh] pr-4">
            <AlertDialogDescription asChild>
              <div className="text-sm text-muted-foreground space-y-4">
                {/* PLACEHOLDER - Substitua pelo conteúdo da política de privacidade */}
                <p>
                  <strong>1. Coleta de Dados</strong>
                </p>
                <p>
                  Coletamos informações que você nos fornece diretamente, como nome, email, telefone e dados relacionados aos agendamentos.
                </p>
                <p>
                  <strong>2. Uso das Informações</strong>
                </p>
                <p>
                  Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, processar agendamentos e enviar comunicações relacionadas ao serviço.
                </p>
                <p>
                  <strong>3. Compartilhamento de Dados</strong>
                </p>
                <p>
                  Não vendemos ou compartilhamos suas informações pessoais com terceiros, exceto quando necessário para fornecer nossos serviços ou quando exigido por lei.
                </p>
                <p>
                  <strong>4. Segurança</strong>
                </p>
                <p>
                  Implementamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração ou destruição.
                </p>
                <p>
                  <strong>5. Seus Direitos</strong>
                </p>
                <p>
                  Você tem direito a acessar, corrigir ou excluir suas informações pessoais a qualquer momento.
                </p>
                {/* FIM DO PLACEHOLDER */}
              </div>
            </AlertDialogDescription>
          </ScrollArea>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowFullPolicy(false)}>
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
          <AlertDialogTitle>Política de Privacidade</AlertDialogTitle>
          <AlertDialogDescription>
            Para continuar usando o aplicativo, você precisa aceitar nossa Política de Privacidade. Deseja visualizar a política completa?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFullPolicy(true)}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Política
          </Button>
          <AlertDialogAction onClick={onAccept}>
            Concordo com a Política
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
