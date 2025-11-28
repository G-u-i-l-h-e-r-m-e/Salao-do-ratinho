import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, startOfWeek, addDays, parseISO, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
}

interface RevenueChartProps {
  transactions: Transaction[];
  loading?: boolean;
}

const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function RevenueChart({ transactions, loading }: RevenueChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 }); // Domingo
    
    // Inicializa dados para cada dia da semana com valor 0
    const weekData = dayNames.map((name, index) => ({
      name,
      value: 0,
      date: addDays(weekStart, index),
    }));

    // Soma receitas por dia da semana
    transactions
      .filter(t => t.type === 'income')
      .forEach(transaction => {
        try {
          const transactionDate = parseISO(transaction.date);
          const dayOfWeek = transactionDate.getDay();
          
          // Verifica se a transação é desta semana
          const weekEnd = addDays(weekStart, 6);
          if (isWithinInterval(transactionDate, { start: weekStart, end: weekEnd })) {
            weekData[dayOfWeek].value += transaction.amount;
          }
        } catch (error) {
          console.error('Error parsing transaction date:', error);
        }
      });

    return weekData.map(({ name, value }) => ({ name, value }));
  }, [transactions]);

  const hasData = chartData.some(d => d.value > 0);

  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-serif text-xl font-bold text-foreground mb-6">Receita Semanal</h3>
      <div className="h-64">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !hasData ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Nenhuma receita registrada esta semana</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30, 15%, 18%)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(35, 15%, 60%)"
                tick={{ fill: 'hsl(35, 15%, 60%)' }}
              />
              <YAxis 
                stroke="hsl(35, 15%, 60%)"
                tick={{ fill: 'hsl(35, 15%, 60%)' }}
                tickFormatter={(value) => `R$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(30, 10%, 8%)', 
                  border: '1px solid hsl(30, 15%, 18%)',
                  borderRadius: '8px',
                  color: 'hsl(35, 20%, 95%)'
                }}
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Receita']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(38, 92%, 50%)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
