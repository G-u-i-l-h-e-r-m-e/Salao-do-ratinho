import { Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentCardProps {
  time: string;
  client: string;
  service: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export function AppointmentCard({ time, client, service, status }: AppointmentCardProps) {
  return (
    <div className={cn(
      "glass-card rounded-xl p-4 hover-lift cursor-pointer",
      "border-l-4",
      status === 'confirmed' && "border-l-gold",
      status === 'pending' && "border-l-amber-500",
      status === 'completed' && "border-l-green-500"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gold">
            <Clock className="h-4 w-4" />
            <span className="font-semibold">{time}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{client}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{service}</p>
          </div>
        </div>
        <span className={cn(
          "text-xs font-medium px-3 py-1 rounded-full",
          status === 'confirmed' && "bg-gold/20 text-gold",
          status === 'pending' && "bg-amber-500/20 text-amber-400",
          status === 'completed' && "bg-green-500/20 text-green-400"
        )}>
          {status === 'confirmed' && 'Confirmado'}
          {status === 'pending' && 'Pendente'}
          {status === 'completed' && 'Concluído'}
        </span>
      </div>
    </div>
  );
}
