import { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Download, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PeriodPreset = 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom';

export function ReportDialog({ open, onOpenChange }: ReportDialogProps) {
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('thisMonth');
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handlePresetChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    const today = new Date();
    
    switch (preset) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'last7days':
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case 'last30days':
        setStartDate(subDays(today, 30));
        setEndDate(today);
        break;
      case 'thisMonth':
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      case 'lastMonth':
        const lastMonth = subDays(startOfMonth(today), 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
      case 'thisYear':
        setStartDate(startOfYear(today));
        setEndDate(today);
        break;
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const startStr = format(startDate, 'yyyy-MM-dd');
      const endStr = format(endDate, 'yyyy-MM-dd');

      // Busca dados do período
      const [transactionsRes, summaryRes, clientsRes, appointmentsRes] = await Promise.all([
        api.getTransactions(startStr, endStr),
        api.getTransactionsSummary(startStr, endStr),
        api.getClients(),
        api.getAppointments()
      ]);

      if (!transactionsRes.success || !summaryRes.success) {
        throw new Error('Erro ao buscar dados');
      }

      const transactions = transactionsRes.data || [];
      const summary = summaryRes.data || { income: 0, expense: 0, balance: 0, count: 0 };
      const clients = clientsRes.data || [];
      const appointments = (appointmentsRes.data || []).filter((apt: any) => {
        const aptDate = apt.date;
        return aptDate >= startStr && aptDate <= endStr;
      });

      // Gera conteúdo do relatório
      const reportContent = generateReportContent(
        startDate, 
        endDate, 
        transactions, 
        summary, 
        clients, 
        appointments
      );

      // Download do arquivo
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${startStr}_a_${endStr}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Relatório gerado!',
        description: 'O download foi iniciado automaticamente.'
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o relatório',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const generateReportContent = (
    start: Date,
    end: Date,
    transactions: any[],
    summary: any,
    clients: any[],
    appointments: any[]
  ) => {
    const divider = '═'.repeat(50);
    const lines = [
      divider,
      '              SALÃO DO RATINHO - RELATÓRIO',
      divider,
      '',
      `Período: ${format(start, 'dd/MM/yyyy')} a ${format(end, 'dd/MM/yyyy')}`,
      `Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
      '',
      divider,
      '                    RESUMO FINANCEIRO',
      divider,
      '',
      `  💰 Receita Total:     ${formatCurrency(summary.income)}`,
      `  💸 Despesas Total:    ${formatCurrency(summary.expense)}`,
      `  📊 Saldo do Período:  ${formatCurrency(summary.balance)}`,
      `  📝 Total Transações:  ${summary.count}`,
      '',
      divider,
      '                    AGENDAMENTOS',
      divider,
      '',
      `  📅 Total de Agendamentos: ${appointments.length}`,
      `  ✅ Confirmados: ${appointments.filter((a: any) => a.status === 'confirmed').length}`,
      `  ⏳ Pendentes: ${appointments.filter((a: any) => a.status === 'pending').length}`,
      `  ✔️ Concluídos: ${appointments.filter((a: any) => a.status === 'completed').length}`,
      `  ❌ Cancelados: ${appointments.filter((a: any) => a.status === 'cancelled').length}`,
      '',
    ];

    // Lista de transações
    if (transactions.length > 0) {
      lines.push(divider);
      lines.push('                    TRANSAÇÕES DETALHADAS');
      lines.push(divider);
      lines.push('');
      
      const incomes = transactions.filter(t => t.type === 'income');
      const expenses = transactions.filter(t => t.type === 'expense');

      if (incomes.length > 0) {
        lines.push('  ENTRADAS:');
        incomes.forEach(t => {
          lines.push(`    • ${t.date} - ${t.description}: ${formatCurrency(t.amount)}`);
        });
        lines.push('');
      }

      if (expenses.length > 0) {
        lines.push('  SAÍDAS:');
        expenses.forEach(t => {
          lines.push(`    • ${t.date} - ${t.description}: ${formatCurrency(t.amount)}`);
        });
        lines.push('');
      }
    }

    // Estatísticas de clientes
    lines.push(divider);
    lines.push('                    CLIENTES');
    lines.push(divider);
    lines.push('');
    lines.push(`  👥 Total de Clientes Cadastrados: ${clients.length}`);
    
    const topClients = [...clients]
      .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
      .slice(0, 5);
    
    if (topClients.length > 0) {
      lines.push('');
      lines.push('  🏆 TOP 5 CLIENTES (por valor gasto):');
      topClients.forEach((c, i) => {
        lines.push(`    ${i + 1}. ${c.name} - ${formatCurrency(c.totalSpent || 0)} (${c.visits || 0} visitas)`);
      });
    }

    lines.push('');
    lines.push(divider);
    lines.push('              Relatório gerado pelo sistema');
    lines.push('                 Salão do Ratinho © 2025');
    lines.push(divider);

    return lines.join('\n');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-gold" />
            Gerar Relatório
          </DialogTitle>
          <DialogDescription>
            Selecione o período para gerar o relatório financeiro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Período pré-definido */}
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={periodPreset} onValueChange={(v) => handlePresetChange(v as PeriodPreset)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="last7days">Últimos 7 dias</SelectItem>
                <SelectItem value="last30days">Últimos 30 dias</SelectItem>
                <SelectItem value="thisMonth">Este mês</SelectItem>
                <SelectItem value="lastMonth">Mês passado</SelectItem>
                <SelectItem value="thisYear">Este ano</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Datas customizadas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background border-border",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      if (date) {
                        setStartDate(date);
                        setPeriodPreset('custom');
                      }
                    }}
                    locale={ptBR}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Data Final</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background border-border",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Selecionar"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      if (date) {
                        setEndDate(date);
                        setPeriodPreset('custom');
                      }
                    }}
                    locale={ptBR}
                    disabled={(date) => date < startDate}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Preview do período */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Período selecionado: <span className="text-foreground font-medium">
                {format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span> até <span className="text-foreground font-medium">
                {format(endDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            variant="gold"
            onClick={generateReport}
            disabled={generating}
            className="flex-1"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Baixar Relatório
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}