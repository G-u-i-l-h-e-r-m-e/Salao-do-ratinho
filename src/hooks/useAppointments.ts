import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase.functions.invoke('mongodb-appointments', {
        body: { action: 'list', date: selectedDate },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAppointments(data.data || []);
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
      const { data, error } = await supabase.functions.invoke('mongodb-appointments', {
        body: { action: 'create', data: appointmentData },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: 'Sucesso',
        description: 'Agendamento criado com sucesso',
      });

      await fetchAppointments();
      return data.data;
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
      const { data, error } = await supabase.functions.invoke('mongodb-appointments', {
        body: { action: 'update', id, data: appointmentData },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: 'Sucesso',
        description: 'Agendamento atualizado com sucesso',
      });

      await fetchAppointments();
      return data.data;
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
      const { data, error } = await supabase.functions.invoke('mongodb-appointments', {
        body: { action: 'delete', id },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: 'Sucesso',
        description: 'Agendamento excluído com sucesso',
      });

      await fetchAppointments();
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
