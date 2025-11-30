import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  // Limpa todos os dados de autenticação do localStorage
  const clearAuthData = useCallback(() => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
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
    // Previne inicialização duplicada
    if (initializedRef.current) return;
    initializedRef.current = true;

    // PRIMEIRO: busca a sessão existente
    const initializeAuth = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          setSession(existingSession);
          setUser(existingSession.user);
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error);
      } finally {
        setLoading(false);
      }
    };

    // DEPOIS: configura o listener para mudanças
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Não altera loading aqui - só na inicialização
        setSession(newSession);
        setUser(newSession?.user ?? null);
      }
    );

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  // Auto-refresh a cada 4 minutos
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      refreshSessionIfNeeded();
    }, 4 * 60 * 1000);

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
      
      if (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('session_not_found') || 
            errorMsg.includes('session missing') ||
            errorMsg.includes('auth session')) {
          clearAuthData();
          return { error: null };
        }
        clearAuthData();
        return { error: null };
      }
      
      clearAuthData();
      return { error: null };
    } catch (e) {
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
