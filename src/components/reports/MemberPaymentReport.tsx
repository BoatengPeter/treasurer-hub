'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format-utils';
import { generateMemberReportPdf } from '@/lib/pdf-report';
import type { Transaction, Member } from '@/lib/db';

interface MemberPaymentReportProps {
  transactions: Transaction[];
  members: Member[];
}

type PeriodType = 'month' | 'year';

function getPeriodBounds(date: Date, period: PeriodType) {
  if (period === 'year') {
    return {
      start: new Date(date.getFullYear(), 0, 1),
      end: new Date(date.getFullYear(), 11, 31),
    };
  }
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
  };
}

function periodLabel(start: Date, end: Date, period: PeriodType) {
  if (period === 'year') return `Year ${start.getFullYear()}`;
  return start.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
}

export default function MemberPaymentReport({ transactions, members }: MemberPaymentReportProps) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [periodType, setPeriodType] = useState<PeriodType>('month');
  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [downloading, setDownloading] = useState(false);

  const selectedMember = members.find(m => m.id === selectedMemberId);

  const filteredTransactions = useMemo(() => {
    if (!selectedMemberId || !selectedMember) return [];
    const d = new Date(referenceDate + 'T00:00:00');
    const { start, end } = getPeriodBounds(d, periodType);
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);
    return transactions.filter(t => {
      const td = new Date(t.date + 'T00:00:00');
      return t.member_id === selectedMemberId && td >= start && td <= endOfDay;
    });
  }, [transactions, selectedMemberId, referenceDate, periodType, selectedMember]);

  const incomeTotal = filteredTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expenseTotal = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

  const handleDownload = async () => {
    if (!selectedMember) return;
    setDownloading(true);
    try {
      const d = new Date(referenceDate + 'T00:00:00');
      const { start, end } = getPeriodBounds(d, periodType);
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);
      const periodTxs = transactions.filter(t => {
        const td = new Date(t.date + 'T00:00:00');
        return t.member_id === selectedMemberId && td >= start && td <= endOfDay;
      });
      generateMemberReportPdf(selectedMember, periodTxs, start, endOfDay, periodLabel(start, end, periodType));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="w-[220px]">
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Select Member</label>
            <select
              value={selectedMemberId}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
            >
              <option value="">— Choose a member —</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="w-[120px]">
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Period</label>
            <select
              value={periodType}
              onChange={e => setPeriodType(e.target.value as PeriodType)}
              className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
            >
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>
          <div className="w-[170px]">
            <label className="text-xs font-semibold uppercase tracking-wider block mb-1">Reference Date</label>
            <input
              type="date"
              value={referenceDate}
              onChange={e => setReferenceDate(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
            />
          </div>
          <div className="self-end">
            <Button
              onClick={handleDownload}
              disabled={!selectedMember || downloading}
              className="flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" /> {downloading ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>
      </Card>

      {selectedMember && filteredTransactions.length > 0 && (
        <Card className="p-6">
          <div className="text-center pb-4 border-b border-border mb-4">
            <h3 className="font-heading font-bold text-lg">{selectedMember.name}</h3>
            <p className="text-xs text-muted-foreground">
              {periodLabel(
                getPeriodBounds(new Date(referenceDate + 'T00:00:00'), periodType).start,
                getPeriodBounds(new Date(referenceDate + 'T00:00:00'), periodType).end,
                periodType
              )}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-center">
              <p className="text-xs text-muted-foreground">Payments</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(incomeTotal)}</p>
            </div>
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center">
              <p className="text-xs text-muted-foreground">Expenses</p>
              <p className="text-xl font-bold text-rose-500">{formatCurrency(expenseTotal)}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center">
              <p className="text-xs text-muted-foreground">Net</p>
              <p className={`text-xl font-bold ${(incomeTotal - expenseTotal) >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {formatCurrency(incomeTotal - expenseTotal)}
              </p>
            </div>
          </div>

          <div className="text-xs">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border mb-2">
              <span>Date</span>
              <span className="text-right w-20">Category</span>
              <span className="text-right w-20">Amount</span>
              <span className="text-right w-24">Method</span>
            </div>
            {filteredTransactions
              .sort((a, b) => a.date.localeCompare(b.date))
              .map(tx => (
                <div key={tx.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 py-1.5 border-b border-border/50">
                  <span className="font-mono text-xs">{formatDate(tx.date)}</span>
                  <span className="text-right w-20">{tx.category}</span>
                  <span className={`text-right w-20 font-mono ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <span className="text-right w-24 text-muted-foreground">{tx.payment_method}</span>
                </div>
              ))}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 py-2 mt-2 border-t-2 border-slate-800 text-sm font-bold">
              <span>Total</span>
              <span className="text-right w-20"></span>
              <span className="text-right w-20">{formatCurrency(filteredTransactions.reduce((s, t) => s + Number(t.amount), 0))}</span>
              <span className="text-right w-24"></span>
            </div>
          </div>
        </Card>
      )}

      {selectedMember && filteredTransactions.length === 0 && (
        <p className="text-center text-muted-foreground italic py-8">
          No transactions found for this member in the selected period.
        </p>
      )}
    </div>
  );
}
