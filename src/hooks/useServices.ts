import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Service {
  _id: string;
  name: string;
  price: number;
  duration: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('mongodb-services', {
        body: { action: 'list' },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setServices(data.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os serviços',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = async (serviceData: Omit<Service, '_id'>) => {
    try {
      const { data, error } = await supabase.functions.invoke('mongodb-services', {
        body: { action: 'create', data: serviceData },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: 'Sucesso',
        description: 'Serviço criado com sucesso',
      });

      await fetchServices();
      return data.data;
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o serviço',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateService = async (id: string, serviceData: Partial<Service>) => {
    try {
      const { data, error } = await supabase.functions.invoke('mongodb-services', {
        body: { action: 'update', id, data: serviceData },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: 'Sucesso',
        description: 'Serviço atualizado com sucesso',
      });

      await fetchServices();
      return data.data;
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o serviço',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('mongodb-services', {
        body: { action: 'delete', id },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: 'Sucesso',
        description: 'Serviço excluído com sucesso',
      });

      await fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o serviço',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const activeServices = services.filter(s => s.active);

  return {
    services,
    activeServices,
    loading,
    fetchServices,
    createService,
    updateService,
    deleteService,
  };
}
