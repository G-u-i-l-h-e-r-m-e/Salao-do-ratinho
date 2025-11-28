import { Users, Calendar, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { RevenueChart } from '@/components/RevenueChart';
import { Button } from '@/components/ui/button';

const todayAppointments = [
  { time: '09:00', client: 'João Silva', service: 'Corte + Barba', status: 'completed' as const },
  { time: '10:30', client: 'Pedro Santos', service: 'Corte Degradê', status: 'confirmed' as const },
  { time: '11:30', client: 'Carlos Oliveira', service: 'Barba', status: 'confirmed' as const },
  { time: '14:00', client: 'Rafael Costa', service: 'Corte Social', status: 'pending' as const },
  { time: '15:30', client: 'Lucas Ferreira', service: 'Corte + Hidratação', status: 'pending' as const },
];

const recentClients = [
  { name: 'João Silva', visits: 12, lastVisit: 'Hoje' },
  { name: 'Pedro Santos', visits: 8, lastVisit: 'Ontem' },
  { name: 'Carlos Oliveira', visits: 15, lastVisit: 'Há 2 dias' },
  { name: 'Rafael Costa', visits: 5, lastVisit: 'Há 1 semana' },
];

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="pt-10 lg:pt-0">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground animate-fade-in">
            Bem-vindo de volta!
          </h1>
          <p className="text-muted-foreground mt-2 animate-fade-in stagger-1">
            Aqui está o resumo do seu salão hoje
          </p>
        </div>
        <Button variant="gold" size="lg" className="animate-scale-in stagger-2">
          <Plus className="h-5 w-5" />
          Novo Agendamento
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="animate-slide-up opacity-0 stagger-1">
          <StatCard
            title="Clientes Hoje"
            value="12"
            change="+3 vs ontem"
            changeType="positive"
            icon={Users}
          />
        </div>
        <div className="animate-slide-up opacity-0 stagger-2">
          <StatCard
            title="Agendamentos"
            value="8"
            change="5 confirmados"
            changeType="neutral"
            icon={Calendar}
          />
        </div>
        <div className="animate-slide-up opacity-0 stagger-3">
          <StatCard
            title="Receita Hoje"
            value="R$ 680"
            change="+15% vs média"
            changeType="positive"
            icon={DollarSign}
          />
        </div>
        <div className="animate-slide-up opacity-0 stagger-4">
          <StatCard
            title="Receita Mensal"
            value="R$ 8.450"
            change="Meta: R$ 10.000"
            changeType="neutral"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-foreground">Agendamentos de Hoje</h2>
            <Button variant="ghost" className="text-gold hover:text-gold-light">
              Ver todos
            </Button>
          </div>
          <div className="space-y-3">
            {todayAppointments.map((apt, index) => (
              <div key={index} className="animate-slide-up opacity-0" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                <AppointmentCard {...apt} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-foreground">Clientes Recentes</h2>
            <Button variant="ghost" className="text-gold hover:text-gold-light">
              Ver todos
            </Button>
          </div>
          <div className="glass-card rounded-xl p-4 space-y-4">
            {recentClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                    <span className="text-gold font-semibold text-sm">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.visits} visitas</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{client.lastVisit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart />
    </div>
  );
}
