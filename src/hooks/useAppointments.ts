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
      const response = await api.updateAppointment(id, appointmentData);

      if (response.success) {
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
