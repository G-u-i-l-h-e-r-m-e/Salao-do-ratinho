import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { api } from '@/lib/api';

export type UserRole = 'admin' | 'client' | null;

export function useUserRole() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState<any>(null);

  useEffect(() => {
    async function checkRole() {
      if (authLoading) return;
      
      if (!user) {
        setRole(null);
        setClientData(null);
        setLoading(false);
        return;
      }

      try {
        // Verifica se o email do usuário existe na tabela de clientes
        const response = await api.getClients();
        
        if (response.success && response.data) {
          const client = response.data.find(
            (c: any) => c.email.toLowerCase() === user.email?.toLowerCase()
          );
          
          if (client) {
            setRole('client');
            setClientData(client);
          } else {
            // Se não está na tabela de clientes, é admin (barbeiro)
            setRole('admin');
            setClientData(null);
          }
        } else {
          setRole('admin');
          setClientData(null);
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setRole('admin');
        setClientData(null);
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, [user, authLoading]);

  return { role, loading: loading || authLoading, clientData, user };
}
