import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Client {
  _id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  visits: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClientInput {
  name: string;
  phone: string;
  email: string;
  notes?: string;
  visits?: number;
  totalSpent?: number;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('mongodb-clients', {
        body: { action: 'list' }
      });

      if (error) throw error;
      
      if (data?.success) {
        setClients(data.data || []);
      } else {
        throw new Error(data?.error || 'Failed to fetch clients');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao carregar clientes';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const createClient = async (clientData: ClientInput) => {
    try {
      const { data, error } = await supabase.functions.invoke('mongodb-clients', {
        body: { action: 'create', data: clientData }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: 'Sucesso',
          description: 'Cliente criado com sucesso!'
        });
        await fetchClients();
        return data.data;
      } else {
        throw new Error(data?.error || 'Failed to create client');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao criar cliente';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateClient = async (id: string, clientData: Partial<ClientInput>) => {
    try {
      const { data, error } = await supabase.functions.invoke('mongodb-clients', {
        body: { action: 'update', id, data: clientData }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: 'Sucesso',
          description: 'Cliente atualizado com sucesso!'
        });
        await fetchClients();
        return data.data;
      } else {
        throw new Error(data?.error || 'Failed to update client');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar cliente';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive'
      });
      return null;
    }
  };

  const deleteClient = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mongodb-clients', {
        body: { action: 'delete', id }
      });

      if (error) throw error;
      
      if (data?.success) {
        toast({
          title: 'Sucesso',
          description: 'Cliente excluído com sucesso!'
        });
        await fetchClients();
        return true;
      } else {
        throw new Error(data?.error || 'Failed to delete client');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir cliente';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    fetchClients,
    createClient,
    updateClient,
    deleteClient
  };
}
