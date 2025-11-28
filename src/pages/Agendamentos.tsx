import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', 
  '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', 
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];

const appointments: Record<string, { client: string; service: string; status: 'confirmed' | 'pending' }> = {
  '09:00': { client: 'João Silva', service: 'Corte + Barba', status: 'confirmed' },
  '10:30': { client: 'Pedro Santos', service: 'Corte Degradê', status: 'confirmed' },
  '11:30': { client: 'Carlos Oliveira', service: 'Barba', status: 'confirmed' },
  '14:00': { client: 'Rafael Costa', service: 'Corte Social', status: 'pending' },
  '15:30': { client: 'Lucas Ferreira', service: 'Corte + Hidratação', status: 'pending' },
};

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function Agendamentos() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-10 lg:pt-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground mt-2">Gerencie sua agenda diária</p>
        </div>
        <Button variant="gold" size="lg">
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {timeSlots.map((time) => {
            const appointment = appointments[time];
            return (
              <div
                key={time}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200 cursor-pointer",
                  appointment 
                    ? "bg-gold/10 border-gold/30 hover:bg-gold/20" 
                    : "bg-secondary/50 border-border hover:border-gold/50"
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
                    <span className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      appointment.status === 'confirmed' ? "bg-gold/20 text-gold" : "bg-amber-500/20 text-amber-400"
                    )}>
                      {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                    </span>
                  )}
                </div>
                {appointment ? (
                  <div className="mt-2">
                    <p className="font-medium text-foreground">{appointment.client}</p>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">Horário disponível</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
