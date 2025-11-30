import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Appointment } from '@/hooks/useAppointments';
import { useBusinessHours } from '@/hooks/useBusinessHours';
import { useClients, Client } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { useAppointmentConflicts, getEndTime } from '@/hooks/useAppointmentConflicts';
import { AlertCircle, Check, ChevronsUpDown, UserPlus, CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  selectedDate: string;
  selectedTime?: string;
  onSave: (data: Omit<Appointment, '_id'>) => Promise<void>;
  existingAppointments?: Appointment[];
}

export function AppointmentDialog({ 
  open, 
  onOpenChange, 
  appointment, 
  selectedDate,
  selectedTime,
  onSave,
  existingAppointments = []
}: AppointmentDialogProps) {
  const [formData, setFormData] = useState<{
    clientName: string;
    clientPhone: string;
    clientId?: string;
    service: string;
    date: string;
    time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes: string;
  }>({
    clientName: '',
    clientPhone: '',
    clientId: undefined,
    service: '',
    date: selectedDate,
    time: selectedTime || '',
    status: 'pending',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  const { clients } = useClients();
  const { activeServices, services } = useServices();
  const { getTimeSlotsForDate, isClosedOnDate, getDayName, businessHours } = useBusinessHours();
  const { getServiceDuration, getAvailableTimeSlots } = useAppointmentConflicts({
    appointments: existingAppointments,
    services,
    currentAppointmentId: appointment?._id,
  });

  // Duração do serviço selecionado
  const selectedServiceDuration = useMemo(() => {
    if (!formData.service) return 30;
    return getServiceDuration(formData.service);
  }, [formData.service, getServiceDuration]);

  // Filtra clientes baseado na busca
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients;
    const search = clientSearch.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(search) ||
        client.phone.includes(search)
    );
  }, [clients, clientSearch]);

  const handleSelectClient = (client: Client) => {
    setFormData({
      ...formData,
      clientName: client.name,
      clientPhone: client.phone,
      clientId: client._id,
    });
    setClientPopoverOpen(false);
    setClientSearch('');
  };

  const handleNewClient = () => {
    setFormData({
      ...formData,
      clientName: clientSearch,
      clientPhone: '',
      clientId: undefined,
    });
    setClientPopoverOpen(false);
  };

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
    if (appointment) {
      // Tenta encontrar o cliente pelo nome para obter o ID
      const matchedClient = clients.find(c => c.name === appointment.clientName);
      setFormData({
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone || '',
        clientId: matchedClient?._id,
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
        clientId: undefined,
        service: '',
        date: selectedDate,
        time: selectedTime || '',
        status: 'pending',
        notes: '',
      });
    }
  }, [appointment, selectedDate, selectedTime, open, clients]);

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

  // Valida se o formulário está completo
  const isFormValid = useMemo(() => {
    return (
      formData.clientName.trim() !== '' &&
      formData.service !== '' &&
      formData.time !== '' &&
      formData.date !== '' &&
      !isClosed &&
      timeSlots.includes(formData.time)
    );
  }, [formData, isClosed, timeSlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação adicional antes de salvar
    if (!isFormValid) {
      return;
    }
    
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
            <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={clientPopoverOpen}
                  className="w-full justify-between font-normal"
                >
                  {formData.clientName || "Selecione ou digite um cliente..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Buscar cliente..."
                    value={clientSearch}
                    onValueChange={setClientSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="py-2 text-center text-sm">
                        <p className="text-muted-foreground mb-2">Nenhum cliente encontrado</p>
                        {clientSearch && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={handleNewClient}
                          >
                            <UserPlus className="h-4 w-4" />
                            Usar "{clientSearch}" como novo
                          </Button>
                        )}
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredClients.map((client) => (
                        <CommandItem
                          key={client._id}
                          value={client._id}
                          onSelect={() => handleSelectClient(client)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.clientId === client._id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{client.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {client.phone} • {client.visits} visitas
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
              ) : timeSlots.length === 0 ? (
                <div className="flex items-center gap-2 h-10 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-md">
                  Sem horários
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
            <Button type="submit" variant="gold" disabled={loading || !isFormValid}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
