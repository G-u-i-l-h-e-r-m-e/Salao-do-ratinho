import { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Plus, Trash2, Edit, FileText } from 'lucide-react';
import { usePagination } from '@/hooks/usePagination';
import { PaginationControls } from '@/components/PaginationControls';
import { StatCard } from '@/components/StatCard';
import { RevenueChart } from '@/components/RevenueChart';
import { Button } from '@/components/ui/button';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { TransactionDialog } from '@/components/TransactionDialog';
import { ReportDialog } from '@/components/ReportDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Financeiro() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const { transactions, summary, loading, createTransaction, updateTransaction, deleteTransaction } = useTransactions();

  // Pagination for transactions
  const transactionsPagination = usePagination(transactions, { itemsPerPage: 6 });

  const handleNewTransaction = () => {
    setSelectedTransaction(null);
    setDialogOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleSaveTransaction = async (data: Omit<Transaction, '_id'>) => {
    if (selectedTransaction) {
      await updateTransaction(selectedTransaction._id, data);
    } else {
      await createTransaction(data);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setTransactionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
      case 'dinheiro': return 'Dinheiro';
      case 'pix': return 'PIX';
      case 'cartao_credito': return 'Cartão de Crédito';
      case 'cartao_debito': return 'Cartão de Débito';
      default: return method || '-';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-10 lg:pt-0">
        <div>
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-2">Acompanhe suas receitas e despesas</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setReportDialogOpen(true)}>
            <FileText className="h-5 w-5" />
            Relatório
          </Button>
          <Button variant="gold" size="lg" onClick={handleNewTransaction}>
            <Plus className="h-5 w-5" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Receita Total"
          value={loading ? '...' : formatCurrency(summary?.income || 0)}
          change="Entradas do mês"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Despesas"
          value={loading ? '...' : formatCurrency(summary?.expense || 0)}
          change="Saídas do mês"
          changeType="negative"
          icon={TrendingDown}
        />
        <StatCard
          title="Saldo"
          value={loading ? '...' : formatCurrency(summary?.balance || 0)}
          change="Balanço atual"
          changeType={summary?.balance && summary.balance >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
        />
        <StatCard
          title="Transações"
          value={loading ? '...' : String(summary?.count || 0)}
          change="Este mês"
          changeType="neutral"
          icon={TrendingUp}
        />
      </div>

      {/* Chart */}
      <RevenueChart transactions={transactions} loading={loading} />

      {/* Transactions */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-serif text-xl font-bold text-foreground mb-6">Transações</h3>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma transação registrada</p>
            <Button variant="outline" className="mt-4" onClick={handleNewTransaction}>
              Adicionar transação
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {transactionsPagination.paginatedItems.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="h-5 w-5 text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.clientName && `${transaction.clientName} • `}
                        {getPaymentMethodLabel(transaction.paymentMethod)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditTransaction(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(transaction._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {transactionsPagination.showPagination && (
              <PaginationControls
                currentPage={transactionsPagination.currentPage}
                totalPages={transactionsPagination.totalPages}
                onPageChange={transactionsPagination.goToPage}
                hasNextPage={transactionsPagination.hasNextPage}
                hasPreviousPage={transactionsPagination.hasPreviousPage}
              />
            )}
          </>
        )}
      </div>

      <TransactionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={selectedTransaction}
        onSave={handleSaveTransaction}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
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

      <ReportDialog
        open={reportDialogOpen}
        onOpenChange={setReportDialogOpen}
      />
    </div>
  );
}
