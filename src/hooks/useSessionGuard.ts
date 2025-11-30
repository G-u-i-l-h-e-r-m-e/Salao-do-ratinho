import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useNavigate } from 'react-router-dom';

export function useSessionGuard() {
  const { session } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Verifica se a sessão é válida e tenta renovar se necessário
   * Retorna true se a sessão é válida, false se expirou e não pôde ser renovada
   */
  const checkSession = useCallback(async (): Promise<boolean> => {
    try {
      // Se não há sessão, redireciona para login
      if (!session) {
        navigate('/auth');
        return false;
      }

      // Verifica se o token está próximo de expirar (5 minutos)
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const expirationTime = expiresAt * 1000; // Converter para milliseconds
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        // Se expira em menos de 5 minutos, tenta renovar
        if (expirationTime - now < fiveMinutes) {
          const { data, error } = await supabase.auth.refreshSession();
          
          if (error || !data.session) {
            toast({
              title: 'Sessão expirada',
              description: 'Faça login novamente para continuar.',
              variant: 'destructive',
            });
            await supabase.auth.signOut({ scope: 'local' });
            navigate('/auth');
            return false;
          }
        }
      }

      // Verifica se a sessão ainda é válida no servidor
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error || !currentSession) {
        toast({
          title: 'Sessão inválida',
          description: 'Faça login novamente para continuar.',
          variant: 'destructive',
        });
        await supabase.auth.signOut({ scope: 'local' });
        navigate('/auth');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      return false;
    }
  }, [session, navigate, toast]);

  /**
   * Executa uma operação crítica apenas se a sessão for válida
   * Retorna o resultado da operação ou null se a sessão for inválida
   */
  const withSessionCheck = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    const isValid = await checkSession();
    if (!isValid) {
      return null;
    }
    return operation();
  }, [checkSession]);

  return {
    checkSession,
    withSessionCheck,
  };
}
