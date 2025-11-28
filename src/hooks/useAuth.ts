import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Limpa todos os dados de autenticação do localStorage
  const clearAuthData = useCallback(() => {
    // Remove todas as chaves relacionadas ao Supabase auth
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Limpa estado local
    setSession(null);
    setUser(null);
  }, []);

  // Função para verificar e renovar sessão
  const refreshSessionIfNeeded = useCallback(async () => {
    if (!session) return;
    
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const expirationTime = expiresAt * 1000;
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      // Se expira em menos de 5 minutos, renova
      if (expirationTime - now < fiveMinutes) {
        const { data } = await supabase.auth.refreshSession();
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      }
    }
  }, [session]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-refresh a cada 4 minutos
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      refreshSessionIfNeeded();
    }, 4 * 60 * 1000); // 4 minutos

    return () => clearInterval(interval);
  }, [session, refreshSessionIfNeeded]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Se deu erro de sessão não encontrada, limpa tudo localmente
      if (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('session_not_found') || 
            errorMsg.includes('session missing') ||
            errorMsg.includes('auth session')) {
          clearAuthData();
          return { error: null };
        }
        // Outro erro - mesmo assim limpa localmente
        clearAuthData();
        return { error: null };
      }
      
      // Sucesso - limpa estado
      clearAuthData();
      return { error: null };
    } catch (e) {
      // Qualquer erro - limpa localmente
      clearAuthData();
      return { error: null };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSessionIfNeeded,
  };
}
