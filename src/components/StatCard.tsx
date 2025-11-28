import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, className }: StatCardProps) {
  return (
    <div className={cn(
      "glass-card rounded-xl p-6 hover-lift",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <h3 className="text-3xl font-serif font-bold mt-2 text-foreground">{value}</h3>
          {change && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              changeType === 'positive' && "text-green-400",
              changeType === 'negative' && "text-red-400",
              changeType === 'neutral' && "text-muted-foreground"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-xl bg-gold/10">
          <Icon className="h-6 w-6 text-gold" />
        </div>
      </div>
    </div>
  );
}
