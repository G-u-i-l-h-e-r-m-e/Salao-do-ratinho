import { useMemo, useCallback } from 'react';
import { Appointment } from '@/hooks/useAppointments';
import { Service } from '@/hooks/useServices';

// Converte horário string "HH:MM" para minutos desde meia-noite
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

// Converte minutos para string "HH:MM"
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Calcula o horário de término baseado no início e duração
export function getEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeToMinutes(startTime);
  return minutesToTime(startMinutes + durationMinutes);
}

interface UseAppointmentConflictsProps {
  appointments: Appointment[];
  services: Service[];
  currentAppointmentId?: string; // Para excluir o agendamento atual ao editar
}

export function useAppointmentConflicts({
  appointments,
  services,
  currentAppointmentId,
}: UseAppointmentConflictsProps) {
  // Cria um mapa de serviço -> duração
  const serviceDurationMap = useMemo(() => {
    const map: Record<string, number> = {};
    services.forEach((service) => {
      map[service.name] = service.duration || 30;
    });
    return map;
  }, [services]);

  // Obtém a duração de um serviço pelo nome
  const getServiceDuration = useCallback(
    (serviceName: string): number => {
      return serviceDurationMap[serviceName] || 30;
    },
    [serviceDurationMap]
  );

  // Verifica se um horário específico está em conflito com os agendamentos existentes
  const hasConflict = useCallback(
    (proposedStartTime: string, proposedDuration: number, date: string): boolean => {
      const proposedStartMinutes = timeToMinutes(proposedStartTime);
      const proposedEndMinutes = proposedStartMinutes + proposedDuration;

      for (const apt of appointments) {
        // Ignora o agendamento atual (ao editar)
        if (apt._id === currentAppointmentId) continue;
        // Ignora agendamentos de outras datas
        if (apt.date !== date) continue;
        // Ignora agendamentos cancelados
        if (apt.status === 'cancelled') continue;

        const aptDuration = getServiceDuration(apt.service);
        const aptStartMinutes = timeToMinutes(apt.time);
        const aptEndMinutes = aptStartMinutes + aptDuration;

        // Verifica sobreposição
        // Conflito existe se: início proposto < fim existente E fim proposto > início existente
        if (proposedStartMinutes < aptEndMinutes && proposedEndMinutes > aptStartMinutes) {
          return true;
        }
      }

      return false;
    },
    [appointments, currentAppointmentId, getServiceDuration]
  );

  // Filtra slots disponíveis removendo os que têm conflito
  const getAvailableTimeSlots = useCallback(
    (allSlots: string[], serviceDuration: number, date: string, businessEndTime?: string): string[] => {
      return allSlots.filter((slot) => {
        // Verifica se o slot não tem conflito
        if (hasConflict(slot, serviceDuration, date)) {
          return false;
        }

        // Verifica se o serviço cabe antes do fechamento
        if (businessEndTime) {
          const slotEndMinutes = timeToMinutes(slot) + serviceDuration;
          const businessEndMinutes = timeToMinutes(businessEndTime);
          if (slotEndMinutes > businessEndMinutes) {
            return false;
          }
        }

        return true;
      });
    },
    [hasConflict]
  );

  // Obtém informações de ocupação para exibição na agenda
  const getOccupiedSlots = useCallback(
    (date: string): Map<string, { appointment: Appointment; duration: number; isStart: boolean; isEnd: boolean }> => {
      const occupiedMap = new Map();

      for (const apt of appointments) {
        if (apt.date !== date) continue;
        if (apt.status === 'cancelled') continue;

        const duration = getServiceDuration(apt.service);
        const startMinutes = timeToMinutes(apt.time);
        const endMinutes = startMinutes + duration;

        // Marca todos os slots de 30 min que este agendamento ocupa
        for (let m = startMinutes; m < endMinutes; m += 30) {
          const slotTime = minutesToTime(m);
          occupiedMap.set(slotTime, {
            appointment: apt,
            duration,
            isStart: m === startMinutes,
            isEnd: m + 30 >= endMinutes,
          });
        }
      }

      return occupiedMap;
    },
    [appointments, getServiceDuration]
  );

  return {
    getServiceDuration,
    hasConflict,
    getAvailableTimeSlots,
    getOccupiedSlots,
    serviceDurationMap,
  };
}
