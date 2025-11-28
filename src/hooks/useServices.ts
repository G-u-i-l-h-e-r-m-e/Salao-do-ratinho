import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
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
      const response = await api.getServices();

      if (response.success) {
        setServices(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to fetch services');
      }
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
      const response = await api.createService(serviceData);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Serviço criado com sucesso',
        });
        await fetchServices();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create service');
      }
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
      const response = await api.updateService(id, serviceData);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Serviço atualizado com sucesso',
        });
        await fetchServices();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update service');
      }
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
      const response = await api.deleteService(id);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Serviço excluído com sucesso',
        });
        await fetchServices();
      } else {
        throw new Error(response.error || 'Failed to delete service');
      }
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
