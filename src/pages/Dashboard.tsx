import { useMemo } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { startOfWeek, endOfWeek } from 'date-fns';
import { StatCard } from '@/components/StatCard';
import { AppointmentCard } from '@/components/AppointmentCard';
import { RevenueChart } from '@/components/RevenueChart';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useClients } from '@/hooks/useClients';
import { useAppointments } from '@/hooks/useAppointments';
import { useTransactions } from '@/hooks/useTransactions';

export function Dashboard() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];
  
  // Get first and last day of current month
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
  
  // Get first and last day of current week
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }).toISOString().split('T')[0];
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 }).toISOString().split('T')[0];

  const { clients, loading: clientsLoading } = useClients();
  const { appointments: todayAppointments, loading: appointmentsLoading } = useAppointments(today);
  const { transactions: todayTransactions, loading: todayTransactionsLoading } = useTransactions(today, today);
  const { transactions: weeklyTransactions, loading: weeklyLoading } = useTransactions(weekStart, weekEnd);
  const { summary: monthlySummary, loading: monthlyLoading } = useTransactions(firstDayOfMonth, lastDayOfMonth);

  const loading = clientsLoading || appointmentsLoading || todayTransactionsLoading || monthlyLoading || weeklyLoading;

  const stats = useMemo(() => {
    const todayIncome = todayTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const confirmedAppointments = todayAppointments.filter(a => a.status === 'confirmed').length;

    return {
      todayClients: todayAppointments.length,
      totalAppointments: todayAppointments.length,
      confirmedAppointments,
      todayIncome,
      monthlyIncome: monthlySummary?.income || 0,
    };
  }, [todayAppointments, todayTransactions, monthlySummary]);

  const recentClients = useMemo(() => {
    return clients
      .sort((a, b) => (b.visits || 0) - (a.visits || 0))
      .slice(0, 4)
      .map(client => ({
        name: client.name,
        visits: client.visits || 0,
        lastVisit: client.updatedAt ? formatRelativeDate(new Date(client.updatedAt)) : '-',
      }));
  }, [clients]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

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
        <Button 
          variant="gold" 
          size="lg" 
          className="animate-scale-in stagger-2"
          onClick={() => navigate('/agendamentos')}
        >
          <Plus className="h-5 w-5" />
          Novo Agendamento
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="animate-slide-up opacity-0 stagger-1">
          {loading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : (
            <StatCard
              title="Clientes Hoje"
              value={String(stats.todayClients)}
              change={`${stats.confirmedAppointments} confirmados`}
              changeType="neutral"
              icon={Users}
            />
          )}
        </div>
        <div className="animate-slide-up opacity-0 stagger-2">
          {loading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : (
            <StatCard
              title="Agendamentos"
              value={String(stats.totalAppointments)}
              change={`${stats.confirmedAppointments} confirmados`}
              changeType="neutral"
              icon={Calendar}
            />
          )}
        </div>
        <div className="animate-slide-up opacity-0 stagger-3">
          {loading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : (
            <StatCard
              title="Receita Hoje"
              value={formatCurrency(stats.todayIncome)}
              change="Entradas do dia"
              changeType="positive"
              icon={DollarSign}
            />
          )}
        </div>
        <div className="animate-slide-up opacity-0 stagger-4">
          {loading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : (
            <StatCard
              title="Receita Mensal"
              value={formatCurrency(stats.monthlyIncome)}
              change="Este mês"
              changeType="positive"
              icon={TrendingUp}
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-foreground">Agendamentos de Hoje</h2>
            <Button 
              variant="ghost" 
              className="text-gold hover:text-gold-light"
              onClick={() => navigate('/agendamentos')}
            >
              Ver todos
            </Button>
          </div>
          <div className="space-y-3">
            {appointmentsLoading ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))
            ) : todayAppointments.length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <p className="text-muted-foreground">Nenhum agendamento para hoje</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => navigate('/agendamentos')}
                >
                  Criar agendamento
                </Button>
              </div>
            ) : (
              todayAppointments
                .filter(apt => apt.status !== 'cancelled')
                .slice(0, 5)
                .map((apt, index) => (
                  <div key={apt._id} className="animate-slide-up opacity-0" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                    <AppointmentCard 
                      time={apt.time}
                      client={apt.clientName}
                      service={apt.service}
                      status={apt.status as 'pending' | 'confirmed' | 'completed'}
                    />
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recent Clients */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-foreground">Clientes Recentes</h2>
            <Button 
              variant="ghost" 
              className="text-gold hover:text-gold-light"
              onClick={() => navigate('/clientes')}
            >
              Ver todos
            </Button>
          </div>
          <div className="glass-card rounded-xl p-4 space-y-4">
            {clientsLoading ? (
              [...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))
            ) : recentClients.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm">Nenhum cliente cadastrado</p>
              </div>
            ) : (
              recentClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                      <span className="text-gold font-semibold text-sm">
                        {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.visits} visitas</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{client.lastVisit}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart transactions={weeklyTransactions} loading={weeklyLoading} />
    </div>
  );
}

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
  return `Há ${Math.floor(diffDays / 30)} meses`;
}
