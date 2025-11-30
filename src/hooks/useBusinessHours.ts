import { useState, useEffect, useCallback } from 'react';

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface BusinessHours {
  weekdays: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

const defaultBusinessHours: BusinessHours = {
  weekdays: { open: '08:00', close: '18:00', closed: false },
  saturday: { open: '08:00', close: '14:00', closed: false },
  sunday: { open: '', close: '', closed: true },
};

const STORAGE_KEY = 'businessHours';

export function useBusinessHours() {
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultBusinessHours);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setBusinessHours(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing business hours:', e);
      }
    }
  }, []);

  const saveBusinessHours = useCallback((hours: BusinessHours) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hours));
    setBusinessHours(hours);
  }, []);

  // Gera os horários disponíveis para um determinado dia
  const getTimeSlotsForDate = useCallback((date: Date): string[] => {
    const dayOfWeek = date.getDay();
    let dayHours: DayHours;

    if (dayOfWeek === 0) {
      dayHours = businessHours.sunday;
    } else if (dayOfWeek === 6) {
      dayHours = businessHours.saturday;
    } else {
      dayHours = businessHours.weekdays;
    }

    if (dayHours.closed || !dayHours.open || !dayHours.close) {
      return [];
    }

    const slots: string[] = [];
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);

    let currentHour = openHour;
    let currentMin = openMin;

    while (
      currentHour < closeHour ||
      (currentHour === closeHour && currentMin < closeMin)
    ) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      slots.push(timeStr);

      // Avança 30 minutos
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }

    return slots;
  }, [businessHours]);

  // Verifica se um horário está dentro do horário de funcionamento
  const isTimeWithinBusinessHours = useCallback((date: Date, time: string): boolean => {
    const dayOfWeek = date.getDay();
    let dayHours: DayHours;

    if (dayOfWeek === 0) {
      dayHours = businessHours.sunday;
    } else if (dayOfWeek === 6) {
      dayHours = businessHours.saturday;
    } else {
      dayHours = businessHours.weekdays;
    }

    if (dayHours.closed) return false;

    const [timeHour, timeMin] = time.split(':').map(Number);
    const [openHour, openMin] = dayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = dayHours.close.split(':').map(Number);

    const timeInMinutes = timeHour * 60 + timeMin;
    const openInMinutes = openHour * 60 + openMin;
    const closeInMinutes = closeHour * 60 + closeMin;

    return timeInMinutes >= openInMinutes && timeInMinutes < closeInMinutes;
  }, [businessHours]);

  // Retorna o nome do dia em português
  const getDayName = (dayOfWeek: number): string => {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    return days[dayOfWeek];
  };

  // Verifica se o salão está fechado em determinada data
  const isClosedOnDate = useCallback((date: Date): boolean => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) return businessHours.sunday.closed;
    if (dayOfWeek === 6) return businessHours.saturday.closed;
    return businessHours.weekdays.closed;
  }, [businessHours]);

  return {
    businessHours,
    setBusinessHours,
    saveBusinessHours,
    getTimeSlotsForDate,
    isTimeWithinBusinessHours,
    isClosedOnDate,
    getDayName,
    defaultBusinessHours,
  };
}
