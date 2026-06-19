'use client';
import { useMemo } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TransactionFilters from './TransactionFilters';
import TransactionTable from './TransactionTable';

export default function LedgerTab() {
  const { transactions, txSearch, txFilterType, txFilterCategory, setEditingTx, setTxReceiptImage, setIsTxModalOpen } = useDashboardStore();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.description?.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.category?.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.reference?.toLowerCase().includes(txSearch.toLowerCase());
      const matchesType = txFilterType === 'all' || t.type === txFilterType;
      const matchesCategory = txFilterCategory === 'all' || t.category === txFilterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, txSearch, txFilterType, txFilterCategory]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Ledger Registry</h2>
          <p className="text-xs text-muted-foreground">Interactive spreadsheet interface for all transactions</p>
        </div>
        <Button onClick={() => { setEditingTx(null); setTxReceiptImage(''); setIsTxModalOpen(true); }} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </header>
      <TransactionFilters />
      <TransactionTable filteredTransactions={filteredTransactions} />
    </div>
  );
}
