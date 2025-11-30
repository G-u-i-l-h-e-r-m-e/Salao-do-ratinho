import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useBusinessHours } from '@/hooks/useBusinessHours';
import { useServices } from '@/hooks/useServices';
import { useAppointments } from '@/hooks/useAppointments';
import { useAppointmentConflicts, getEndTime } from '@/hooks/useAppointmentConflicts';
import { AlertCircle, CalendarIcon, Clock } from 'lucide-react';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ClientAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  clientName: string;
}

export function ClientAppointmentDialog({ 
  open, 
  onOpenChange, 
  onSave,
  clientName 
}: ClientAppointmentDialogProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [formData, setFormData] = useState({
    service: '',
    date: today,
    time: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const { activeServices, services } = useServices();
  const { getTimeSlotsForDate, isClosedOnDate, getDayName, businessHours } = useBusinessHours();
  const { appointments } = useAppointments(formData.date);
  const { getServiceDuration, getAvailableTimeSlots } = useAppointmentConflicts({
    appointments,
    services,
  });

  // Duração do serviço selecionado
  const selectedServiceDuration = useMemo(() => {
    if (!formData.service) return 30;
    return getServiceDuration(formData.service);
  }, [formData.service, getServiceDuration]);

  // Calcula os slots disponíveis baseado na data selecionada
  const allTimeSlots = useMemo(() => {
    if (!formData.date) return [];
    const date = new Date(formData.date + 'T12:00:00');
    return getTimeSlotsForDate(date);
  }, [formData.date, getTimeSlotsForDate]);

  // Obtém o horário de fechamento do dia
  const businessEndTime = useMemo(() => {
    if (!formData.date) return undefined;
    const date = new Date(formData.date + 'T12:00:00');
    const dayOfWeek = date.getDay();
    const dayMap: Record<number, keyof typeof businessHours> = {
      0: 'sunday', 1: 'weekdays', 2: 'weekdays', 3: 'weekdays',
      4: 'weekdays', 5: 'weekdays', 6: 'saturday',
    };
    const dayKey = dayMap[dayOfWeek];
    return businessHours[dayKey]?.close;
  }, [formData.date, businessHours]);

  // Filtra slots disponíveis considerando conflitos e duração do serviço
  const timeSlots = useMemo(() => {
    if (!formData.service) return allTimeSlots;
    return getAvailableTimeSlots(allTimeSlots, selectedServiceDuration, formData.date, businessEndTime);
  }, [allTimeSlots, formData.service, formData.date, selectedServiceDuration, getAvailableTimeSlots, businessEndTime]);

  const isClosed = useMemo(() => {
    if (!formData.date) return false;
    const date = new Date(formData.date + 'T12:00:00');
    return isClosedOnDate(date);
  }, [formData.date, isClosedOnDate]);

  const dayName = useMemo(() => {
    if (!formData.date) return '';
    const date = new Date(formData.date + 'T12:00:00');
    return getDayName(date.getDay());
  }, [formData.date, getDayName]);

  useEffect(() => {
    if (open) {
      setFormData({
        service: '',
        date: today,
        time: '',
        notes: '',
      });
    }
  }, [open, today]);

  // Limpa o horário se a data/serviço mudar e o horário atual não estiver disponível
  useEffect(() => {
    if (formData.time && !timeSlots.includes(formData.time)) {
      setFormData(prev => ({ ...prev, time: '' }));
    }
  }, [timeSlots, formData.time]);

  // Horário de término do agendamento
  const endTime = useMemo(() => {
    if (!formData.time || !formData.service) return '';
    return getEndTime(formData.time, selectedServiceDuration);
  }, [formData.time, formData.service, selectedServiceDuration]);

  const isFormValid = useMemo(() => {
    return (
      formData.service !== '' &&
      formData.time !== '' &&
      formData.date !== '' &&
      !isClosed &&
      timeSlots.includes(formData.time)
    );
  }, [formData, isClosed, timeSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) return;
    
    setLoading(true);
    try {
      await onSave({
        clientName,
        clientPhone: '',
        service: formData.service,
        date: formData.date,
        time: formData.time,
        status: 'pending',
        notes: formData.notes,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif">Novo Agendamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <div className="p-3 bg-muted/50 rounded-md text-sm">
              {clientName}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Serviço *</Label>
            <Select
              value={formData.service}
              onValueChange={(value) => setFormData({ ...formData, service: value, time: '' })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {activeServices.map((service) => (
                  <SelectItem key={service._id} value={service.name}>
                    {service.name} - R$ {service.price.toFixed(2)} ({service.duration}min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.service && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Duração: {selectedServiceDuration} minutos
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date
                      ? format(parse(formData.date, 'yyyy-MM-dd', new Date()), "dd 'de' MMM", { locale: ptBR })
                      : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date ? parse(formData.date, 'yyyy-MM-dd', new Date()) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, date: format(date, 'yyyy-MM-dd') });
                      }
                    }}
                    disabled={(date) => date < new Date(today)}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              {isClosed ? (
                <div className="flex items-center gap-2 h-10 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  Fechado
                </div>
              ) : !formData.service ? (
                <div className="flex items-center gap-2 h-10 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md">
                  Selecione serviço
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="flex items-center gap-2 h-10 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  Indisponível
                </div>
              ) : (
                <Select
                  value={formData.time}
                  onValueChange={(value) => setFormData({ ...formData, time: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time} - {getEndTime(time, selectedServiceDuration)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {isClosed && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              O salão está fechado aos {dayName.toLowerCase()}s
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Alguma preferência ou informação adicional?"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="gold" disabled={loading || !isFormValid}>
              {loading ? 'Agendando...' : 'Agendar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
