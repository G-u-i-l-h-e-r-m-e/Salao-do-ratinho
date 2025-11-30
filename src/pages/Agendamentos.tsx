import { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, Trash2, Edit, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppointments, Appointment } from '@/hooks/useAppointments';
import { useBusinessHours } from '@/hooks/useBusinessHours';
import { useServices } from '@/hooks/useServices';
import { useAppointmentConflicts, getEndTime } from '@/hooks/useAppointmentConflicts';
import { AppointmentDialog } from '@/components/AppointmentDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function Agendamentos() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);

  const dateString = selectedDate.toISOString().split('T')[0];
  const { appointments, loading, createAppointment, updateAppointment, deleteAppointment } = useAppointments(dateString);
  const { getTimeSlotsForDate, isClosedOnDate, getDayName, businessHours } = useBusinessHours();
  const { services } = useServices();
  const { getServiceDuration, getOccupiedSlots } = useAppointmentConflicts({
    appointments,
    services,
  });

  // Gera os slots de horário baseado no horário de funcionamento
  const timeSlots = useMemo(() => {
    return getTimeSlotsForDate(selectedDate);
  }, [selectedDate, getTimeSlotsForDate, businessHours]);

  const isClosed = useMemo(() => {
    return isClosedOnDate(selectedDate);
  }, [selectedDate, isClosedOnDate, businessHours]);

  // Mapa de slots ocupados com informações de duração
  const occupiedSlots = useMemo(() => {
    return getOccupiedSlots(dateString);
  }, [dateString, getOccupiedSlots, appointments]);

  const getAppointmentByTime = (time: string) => {
    return appointments.find(apt => apt.time === time && apt.status !== 'cancelled');
  };

  const getDaysInWeek = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleNewAppointment = (time?: string) => {
    setSelectedAppointment(null);
    setSelectedTime(time);
    setDialogOpen(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedTime(undefined);
    setDialogOpen(true);
  };

  const handleSaveAppointment = async (data: Omit<Appointment, '_id'>) => {
    if (selectedAppointment) {
      await updateAppointment(selectedAppointment._id, data);
    } else {
      await createAppointment(data);
    }
  };

  const handleDeleteClick = (id: string) => {
    setAppointmentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (appointmentToDelete) {
      await deleteAppointment(appointmentToDelete);
      setAppointmentToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-gold/20 text-gold';
      case 'pending': return 'bg-amber-500/20 text-amber-400';
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-10 lg:pt-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground mt-2">Gerencie sua agenda diária</p>
        </div>
        <Button 
          variant="gold" 
          size="lg" 
          onClick={() => handleNewAppointment()}
          disabled={isClosed}
        >
          <Plus className="h-5 w-5" />
          Novo Agendamento
        </Button>
      </div>

      {/* Week Navigation */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() - 7);
            setSelectedDate(newDate);
          }}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-serif font-bold text-lg text-foreground">
            {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => {
            const newDate = new Date(selectedDate);
            newDate.setDate(newDate.getDate() + 7);
            setSelectedDate(newDate);
          }}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {getDaysInWeek().map((day, index) => {
            const dayIsClosed = isClosedOnDate(day);
            return (
              <button
                key={index}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg transition-all duration-200",
                  isSelected(day) && "bg-gold text-primary-foreground",
                  isToday(day) && !isSelected(day) && "border-2 border-gold",
                  !isSelected(day) && !isToday(day) && "hover:bg-secondary",
                  dayIsClosed && !isSelected(day) && "opacity-50"
                )}
              >
                <span className="text-xs text-muted-foreground">{weekDays[index]}</span>
                <span className={cn(
                  "text-lg font-bold mt-1",
                  isSelected(day) ? "text-primary-foreground" : "text-foreground"
                )}>
                  {day.getDate()}
                </span>
                {dayIsClosed && (
                  <span className="text-[10px] text-muted-foreground">Fechado</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-serif font-bold text-xl text-foreground mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gold" />
          {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </h3>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : isClosed ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-medium text-foreground">Salão Fechado</p>
            <p className="text-muted-foreground mt-2">
              O salão não funciona aos {getDayName(selectedDate.getDay()).toLowerCase()}s
            </p>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl font-medium text-foreground">Sem Horários Configurados</p>
            <p className="text-muted-foreground mt-2">
              Configure os horários de funcionamento nas configurações
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {timeSlots.map((time) => {
              const occupiedInfo = occupiedSlots.get(time);
              const appointment = occupiedInfo?.appointment;
              const isStartSlot = occupiedInfo?.isStart ?? false;
              const isContinuation = occupiedInfo && !isStartSlot;
              
              // Se é continuação de outro agendamento, mostrar slot ocupado
              if (isContinuation && appointment) {
                return (
                  <div
                    key={time}
                    className="p-4 rounded-lg border bg-gold/5 border-gold/20 opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-gold/70">
                        {time}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Ocupado
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        ↳ {appointment.clientName} ({appointment.service})
                      </p>
                    </div>
                  </div>
                );
              }

              // Slot inicial de agendamento ou slot livre
              const serviceDuration = appointment ? getServiceDuration(appointment.service) : 0;
              const endTime = appointment ? getEndTime(appointment.time, serviceDuration) : '';
              
              return (
                <div
                  key={time}
                  onClick={() => !appointment && handleNewAppointment(time)}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-200",
                    appointment 
                      ? "bg-gold/10 border-gold/30" 
                      : "bg-secondary/50 border-border hover:border-gold/50 cursor-pointer"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "font-bold text-lg",
                      appointment ? "text-gold" : "text-muted-foreground"
                    )}>
                      {time}
                      {appointment && endTime && (
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          - {endTime}
                        </span>
                      )}
                    </span>
                    {appointment && (
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs font-medium px-2 py-1 rounded-full",
                          getStatusColors(appointment.status)
                        )}>
                          {getStatusLabel(appointment.status)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAppointment(appointment);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(appointment._id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {appointment ? (
                    <div className="mt-2">
                      <p className="font-medium text-foreground">{appointment.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.service}
                        <span className="ml-2 text-xs">({serviceDuration}min)</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">Horário disponível</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AppointmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        appointment={selectedAppointment}
        selectedDate={dateString}
        selectedTime={selectedTime}
        onSave={handleSaveAppointment}
        existingAppointments={appointments}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
