'use client';
import { useMemo } from 'react';
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpButton from '@/components/ui/HelpButton';
import { formatCurrency } from '@/lib/format-utils';
import type { Transaction } from '@/lib/db';
import TransactionFilters from './TransactionFilters';
import TransactionTable from './TransactionTable';

interface WeekGroup {
  label: string;
  range: string;
  start: string;
  incomeTotal: number;
  net: number;
  transactions: Transaction[];
}

export default function LedgerTab() {
  const { transactions, members, txSearch, txFilterType, txFilterCategory, groupByWeek, setEditingTx, setTxReceiptImage, setIsTxModalOpen } = useDashboardStore();

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const memberName = members.find(m => m.id === t.member_id)?.name?.toLowerCase() || '';
      const matchesSearch = t.description?.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.category?.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.reference?.toLowerCase().includes(txSearch.toLowerCase()) ||
        memberName.includes(txSearch.toLowerCase());
      const matchesType = txFilterType === 'all' || t.type === txFilterType;
      const matchesCategory = txFilterCategory === 'all' || t.category === txFilterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, members, txSearch, txFilterType, txFilterCategory]);

  const weekGroups = useMemo(() => {
    const groups: Record<string, WeekGroup> = {};
    for (const tx of filteredTransactions) {
      const d = parseISO(tx.date);
      const mon = startOfWeek(d, { weekStartsOn: 1 });
      const sun = endOfWeek(d, { weekStartsOn: 1 });
      const key = format(mon, "yyyy-'W'II");
      if (!groups[key]) {
        groups[key] = {
          label: `Week ${format(mon, 'I')}`,
          range: `${format(mon, 'MMM d')} – ${format(sun, 'MMM d, yyyy')}`,
          start: format(mon, 'yyyy-MM-dd'),
          incomeTotal: 0,
          net: 0,
          transactions: [],
        };
      }
      groups[key].transactions.push(tx);
      if (tx.type === 'income') groups[key].incomeTotal += tx.amount;
      else groups[key].net -= tx.amount;
    }
    for (const g of Object.values(groups)) {
      g.net += g.incomeTotal;
    }
    return Object.values(groups).sort((a, b) => b.start.localeCompare(a.start));
  }, [filteredTransactions]);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center gap-4 flex-wrap">
        <div>
        <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Ledger Registry</h2>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-muted-foreground">Interactive spreadsheet interface for all transactions</p>
          <HelpButton title="Ledger Registry">
            <p>The ledger is the complete record of every financial transaction — income and expenses — for the youth group. Every dues payment, offering, donation, and expense is logged here.</p>
            <p><strong>What you can do here:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Browse all transactions in a sortable table</li>
              <li>Filter by type (income/expense), category, or search text</li>
              <li>Search by member name</li>
              <li>Toggle &ldquo;Group by Week&rdquo; to view weekly summaries</li>
              <li>Add, edit, or delete individual transactions</li>
              <li>Upload receipt images for expense records</li>
              <li>View which member a dues payment is linked to</li>
              <li>Track lodgment status of each income entry</li>
            </ul>
          </HelpButton>
        </div>
        </div>
        <Button onClick={() => { setEditingTx(null); setTxReceiptImage(''); setIsTxModalOpen(true); }} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </header>
      <TransactionFilters />
      {groupByWeek ? (
        <div className="flex flex-col gap-6">
          {weekGroups.map(group => (
            <div key={group.start} className="flex flex-col gap-3">
              <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-2.5 border">
                <div>
                  <span className="font-semibold text-sm">{group.label}</span>
                  <span className="text-muted-foreground text-sm ml-2">| {group.range}</span>
                </div>
                <div className="text-sm font-mono">
                  <span className="text-emerald-600">In: {formatCurrency(group.incomeTotal)}</span>
                  <span className="ml-3">
                    Net: <span className={group.net >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                      {group.net >= 0 ? '+' : ''}{formatCurrency(group.net)}
                    </span>
                  </span>
                </div>
              </div>
              <TransactionTable filteredTransactions={group.transactions} />
            </div>
          ))}
        </div>
      ) : (
        <TransactionTable filteredTransactions={filteredTransactions} />
      )}
    </div>
  );
}
