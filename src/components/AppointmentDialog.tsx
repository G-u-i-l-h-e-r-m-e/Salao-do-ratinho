import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Appointment } from '@/hooks/useAppointments';
import { useBusinessHours } from '@/hooks/useBusinessHours';
import { AlertCircle } from 'lucide-react';

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  selectedDate: string;
  selectedTime?: string;
  onSave: (data: Omit<Appointment, '_id'>) => Promise<void>;
}

const services = [
  'Corte',
  'Corte + Barba',
  'Corte Degradê',
  'Corte Social',
  'Barba',
  'Hidratação',
  'Corte + Hidratação',
  'Pigmentação',
];

export function AppointmentDialog({ 
  open, 
  onOpenChange, 
  appointment, 
  selectedDate,
  selectedTime,
  onSave 
}: AppointmentDialogProps) {
  const [formData, setFormData] = useState<{
    clientName: string;
    clientPhone: string;
    service: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes: string;
  }>({
    clientName: '',
    clientPhone: '',
    service: '',
    date: selectedDate,
    time: selectedTime || '',
    status: 'pending',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const { getTimeSlotsForDate, isClosedOnDate, getDayName } = useBusinessHours();

  // Calcula os slots disponíveis baseado na data selecionada
  const timeSlots = useMemo(() => {
    if (!formData.date) return [];
    const date = new Date(formData.date + 'T12:00:00');
    return getTimeSlotsForDate(date);
  }, [formData.date, getTimeSlotsForDate]);

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
    if (appointment) {
      setFormData({
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone || '',
        service: appointment.service,
        date: appointment.date,
        time: appointment.time,
        status: appointment.status,
        notes: appointment.notes || '',
      });
    } else {
      setFormData({
        clientName: '',
        clientPhone: '',
        service: '',
        date: selectedDate,
        time: selectedTime || '',
        status: 'pending',
        notes: '',
      });
    }
  }, [appointment, selectedDate, selectedTime, open]);

  // Limpa o horário se a data mudar e o horário atual não estiver disponível
  useEffect(() => {
    if (formData.time && !timeSlots.includes(formData.time)) {
      setFormData(prev => ({ ...prev, time: '' }));
    }
  }, [timeSlots, formData.time]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nome do Cliente *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientPhone">Telefone</Label>
            <Input
              id="clientPhone"
              value={formData.clientPhone}
              onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="service">Serviço *</Label>
            <Select
              value={formData.service}
              onValueChange={(value) => setFormData({ ...formData, service: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              {isClosed ? (
                <div className="flex items-center gap-2 h-10 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  Fechado
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="flex items-center gap-2 h-10 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md">
                  Sem horários
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
                        {time}
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
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as Appointment['status'] })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="gold" disabled={loading || isClosed || timeSlots.length === 0}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
