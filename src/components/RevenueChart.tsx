import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Seg', value: 320 },
  { name: 'Ter', value: 450 },
  { name: 'Qua', value: 280 },
  { name: 'Qui', value: 520 },
  { name: 'Sex', value: 680 },
  { name: 'Sáb', value: 890 },
  { name: 'Dom', value: 150 },
];

export function RevenueChart() {
  return (
    <div className="glass-card rounded-xl p-6">
      <h3 className="font-serif text-xl font-bold text-foreground mb-6">Receita Semanal</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
              formatter={(value: number) => [`R$ ${value}`, 'Receita']}
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
      </div>
    </div>
  );
}
