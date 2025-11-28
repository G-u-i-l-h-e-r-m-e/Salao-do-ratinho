import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Appointment {
  _id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: string;
}

export function useAppointmentReminder() {
  const { toast } = useToast();
  const notifiedAppointments = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getReminderMinutes = useCallback((): number => {
    const saved = localStorage.getItem('appointmentReminderMinutes');
    return saved ? parseInt(saved, 10) : 10;
  }, []);

  const isReminderEnabled = useCallback((): boolean => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      const notifications = JSON.parse(saved);
      return notifications.appointmentReminder !== false;
    }
    return true; // Enabled by default
  }, []);

  const checkUpcomingAppointments = useCallback(async () => {
    if (!isReminderEnabled()) return;
    
    try {
      const response = await api.getAppointments();
      if (!response.success || !response.data) return;

      const now = new Date();
      const reminderMinutes = getReminderMinutes();

      response.data.forEach((apt: Appointment) => {
        if (apt.status === 'cancelled' || apt.status === 'completed') return;
        if (notifiedAppointments.current.has(apt._id)) return;

        const [year, month, day] = apt.date.split('-').map(Number);
        const [hour, minute] = apt.time.split(':').map(Number);
        const appointmentTime = new Date(year, month - 1, day, hour, minute);

        const diffMs = appointmentTime.getTime() - now.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        // Notifica se está dentro do tempo de lembrete e ainda não passou
        if (diffMinutes > 0 && diffMinutes <= reminderMinutes) {
          notifiedAppointments.current.add(apt._id);
          
          const minutesText = Math.round(diffMinutes);
          toast({
            title: '⏰ Próximo Cliente',
            description: `${apt.clientName} - ${apt.service} em ${minutesText} minuto${minutesText !== 1 ? 's' : ''} (${apt.time})`,
            duration: 10000,
          });
        }
      });
    } catch (error) {
      console.error('Error checking appointments:', error);
    }
  }, [toast, getReminderMinutes, isReminderEnabled]);

  useEffect(() => {
    // Verifica imediatamente ao montar
    checkUpcomingAppointments();

    // Verifica a cada minuto
    intervalRef.current = setInterval(checkUpcomingAppointments, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkUpcomingAppointments]);

  return { checkUpcomingAppointments };
}
