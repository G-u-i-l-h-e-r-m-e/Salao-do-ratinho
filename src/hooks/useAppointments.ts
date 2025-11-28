import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export interface Appointment {
  _id: string;
  clientName: string;
  clientPhone?: string;
  service: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function useAppointments(selectedDate?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getAppointments(selectedDate);

      if (response.success) {
        setAppointments(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os agendamentos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDate, toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Busca o preço do serviço pelo nome
  const getServicePrice = async (serviceName: string): Promise<number> => {
    try {
      const response = await api.getServices();
      if (response.success && response.data) {
        const service = response.data.find((s: any) => s.name === serviceName);
        return service?.price || 0;
      }
    } catch (error) {
      console.error('Error fetching service price:', error);
    }
    return 0;
  };

  // Cria uma transação de receita automaticamente
  const createRevenueTransaction = async (appointment: Appointment, price: number) => {
    try {
      const transactionData = {
        type: 'income' as const,
        amount: price,
        description: `${appointment.service} - ${appointment.clientName}`,
        paymentMethod: 'dinheiro',
        clientName: appointment.clientName,
        date: appointment.date,
      };

      const response = await api.createTransaction(transactionData);
      
      if (response.success) {
        toast({
          title: 'Receita registrada',
          description: `R$ ${price.toFixed(2)} adicionado automaticamente`,
        });
      }
    } catch (error) {
      console.error('Error creating revenue transaction:', error);
      toast({
        title: 'Aviso',
        description: 'Agendamento concluído, mas não foi possível registrar a receita automaticamente',
        variant: 'destructive',
      });
    }
  };

  // Incrementa as visitas do cliente
  const incrementClientVisits = async (clientName: string) => {
    try {
      // Busca o cliente pelo nome
      const clientsResponse = await api.getClients();
      if (clientsResponse.success && clientsResponse.data) {
        const client = clientsResponse.data.find((c: any) => c.name === clientName);
        if (client) {
          await api.updateClient(client._id, {
            visits: (client.visits || 0) + 1,
          });
        }
      }
    } catch (error) {
      console.error('Error incrementing client visits:', error);
    }
  };

  const createAppointment = async (appointmentData: Omit<Appointment, '_id'>) => {
    try {
      const response = await api.createAppointment(appointmentData);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Agendamento criado com sucesso',
        });
        await fetchAppointments();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o agendamento',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    try {
      // Busca o agendamento atual para verificar mudança de status
      const currentAppointment = appointments.find(a => a._id === id);
      const isBeingCompleted = 
        appointmentData.status === 'completed' && 
        currentAppointment?.status !== 'completed';

      const response = await api.updateAppointment(id, appointmentData);

      if (response.success) {
        // Se o agendamento foi marcado como concluído, cria a transação e incrementa visitas
        if (isBeingCompleted && currentAppointment) {
          const serviceName = appointmentData.service || currentAppointment.service;
          const price = await getServicePrice(serviceName);
          
          if (price > 0) {
            await createRevenueTransaction({
              ...currentAppointment,
              ...appointmentData,
            } as Appointment, price);
          } else {
            toast({
              title: 'Aviso',
              description: 'Serviço não encontrado ou sem preço definido',
              variant: 'destructive',
            });
          }

          // Incrementa as visitas do cliente
          await incrementClientVisits(appointmentData.clientName || currentAppointment.clientName);
        }

        toast({
          title: 'Sucesso',
          description: 'Agendamento atualizado com sucesso',
        });
        await fetchAppointments();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o agendamento',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const response = await api.deleteAppointment(id);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Agendamento excluído com sucesso',
        });
        await fetchAppointments();
      } else {
        throw new Error(response.error || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o agendamento',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    appointments,
    loading,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  };
}
