import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppointments, Appointment } from '@/hooks/useAppointments';
import { AppointmentDialog } from '@/components/AppointmentDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', 
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

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

  const getAppointmentByTime = (time: string) => {
    return appointments.find(apt => apt.time === time);
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
        <Button variant="gold" size="lg" onClick={() => handleNewAppointment()}>
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
          {getDaysInWeek().map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-all duration-200",
                isSelected(day) && "bg-gold text-primary-foreground",
                isToday(day) && !isSelected(day) && "border-2 border-gold",
                !isSelected(day) && !isToday(day) && "hover:bg-secondary"
              )}
            >
              <span className="text-xs text-muted-foreground">{weekDays[index]}</span>
              <span className={cn(
                "text-lg font-bold mt-1",
                isSelected(day) ? "text-primary-foreground" : "text-foreground"
              )}>
                {day.getDate()}
              </span>
            </button>
          ))}
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
            {timeSlots.map((time) => (
              <Skeleton key={time} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {timeSlots.map((time) => {
              const appointment = getAppointmentByTime(time);
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
                      <p className="text-sm text-muted-foreground">{appointment.service}</p>
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
