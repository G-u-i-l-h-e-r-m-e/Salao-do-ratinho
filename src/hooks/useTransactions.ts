import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useSessionGuard } from '@/hooks/useSessionGuard';

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  paymentMethod?: string;
  clientName?: string;
  date: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TransactionSummary {
  income: number;
  expense: number;
  balance: number;
  count: number;
}

export function useTransactions(startDate?: string, endDate?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { checkSession } = useSessionGuard();

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getTransactions(startDate, endDate);

      if (response.success) {
        setTransactions(response.data || []);
      } else {
        throw new Error(response.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as transações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, toast]);

  const fetchSummary = useCallback(async () => {
    try {
      const response = await api.getTransactionsSummary(startDate, endDate);

      if (response.success) {
        setSummary(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch summary');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [fetchTransactions, fetchSummary]);

  const createTransaction = async (transactionData: Omit<Transaction, '_id'>) => {
    // Verifica sessão antes de operação crítica
    const isValid = await checkSession();
    if (!isValid) return null;

    try {
      const response = await api.createTransaction(transactionData);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Transação registrada com sucesso',
        });
        await fetchTransactions();
        await fetchSummary();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a transação',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    // Verifica sessão antes de operação crítica
    const isValid = await checkSession();
    if (!isValid) return null;

    try {
      const response = await api.updateTransaction(id, transactionData);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Transação atualizada com sucesso',
        });
        await fetchTransactions();
        await fetchSummary();
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a transação',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    // Verifica sessão antes de operação crítica
    const isValid = await checkSession();
    if (!isValid) return;

    try {
      const response = await api.deleteTransaction(id);

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Transação excluída com sucesso',
        });
        await fetchTransactions();
        await fetchSummary();
      } else {
        throw new Error(response.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a transação',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    transactions,
    summary,
    loading,
    fetchTransactions,
    fetchSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
