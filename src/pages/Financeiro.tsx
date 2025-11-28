import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { RevenueChart } from '@/components/RevenueChart';

const transactions = [
  { id: 1, client: 'João Silva', service: 'Corte + Barba', amount: 80, type: 'income', date: '28/11/2025 09:30' },
  { id: 2, client: 'Pedro Santos', service: 'Corte Degradê', amount: 50, type: 'income', date: '28/11/2025 10:45' },
  { id: 3, description: 'Produtos de higiene', amount: 150, type: 'expense', date: '28/11/2025 12:00' },
  { id: 4, client: 'Carlos Oliveira', service: 'Barba', amount: 35, type: 'income', date: '28/11/2025 11:45' },
  { id: 5, client: 'Rafael Costa', service: 'Corte Social', amount: 45, type: 'income', date: '27/11/2025 14:30' },
  { id: 6, description: 'Energia elétrica', amount: 280, type: 'expense', date: '27/11/2025 08:00' },
];

const services = [
  { name: 'Corte + Barba', count: 45, revenue: 3600 },
  { name: 'Corte Degradê', count: 38, revenue: 1900 },
  { name: 'Corte Social', count: 32, revenue: 1440 },
  { name: 'Barba', count: 28, revenue: 980 },
  { name: 'Hidratação', count: 15, revenue: 600 },
];

export function Financeiro() {
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pt-10 lg:pt-0">
        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground mt-2">Acompanhe suas receitas e despesas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Receita Mensal"
          value="R$ 8.450"
          change="+12% vs mês anterior"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Despesas"
          value="R$ 2.130"
          change="-5% vs mês anterior"
          changeType="positive"
          icon={TrendingDown}
        />
        <StatCard
          title="Lucro Líquido"
          value="R$ 6.320"
          change="+18% vs mês anterior"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Ticket Médio"
          value="R$ 58"
          change="+R$ 3 vs mês anterior"
          changeType="positive"
          icon={TrendingUp}
        />
      </div>

      {/* Chart and Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-serif text-xl font-bold text-foreground mb-6">Serviços Mais Vendidos</h3>
          <div className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{service.name}</span>
                  <span className="text-sm text-gold font-semibold">R$ {service.revenue.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                      style={{ width: `${(service.count / 45) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12">{service.count}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-serif text-xl font-bold text-foreground mb-6">Transações Recentes</h3>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="h-5 w-5 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {transaction.client || transaction.description}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {transaction.service || 'Despesa'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount}
                </p>
                <p className="text-xs text-muted-foreground">{transaction.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
