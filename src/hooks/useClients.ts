import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
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
      const response = await api.getClients();

      if (response.success) {
        setClients(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to fetch clients');
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
      const response = await api.createClient(clientData);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Cliente criado com sucesso!'
        });
        await fetchClients();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create client');
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
      const response = await api.updateClient(id, clientData);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Cliente atualizado com sucesso!'
        });
        await fetchClients();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update client');
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
      const response = await api.deleteClient(id);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Cliente excluído com sucesso!'
        });
        await fetchClients();
        return true;
      } else {
        throw new Error(response.error || 'Failed to delete client');
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
