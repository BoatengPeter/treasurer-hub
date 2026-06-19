'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format-utils';
import type { Transaction, Member } from '@/lib/db';

interface DuesReportAreaProps {
  transactions: Transaction[];
  members: Member[];
  referenceDate: string;
  period: 'weekly' | 'monthly' | 'yearly';
}

function getPeriodBounds(dateStr: string, period: 'weekly' | 'monthly' | 'yearly') {
  const d = new Date(dateStr + 'T00:00:00');
  if (period === 'weekly') {
    const day = d.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMon);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday, end: sunday };
  }
  if (period === 'yearly') {
    return {
      start: new Date(d.getFullYear(), 0, 1),
      end: new Date(d.getFullYear(), 11, 31),
    };
  }
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { start, end };
}

function periodLabel(start: Date, end: Date, period: 'weekly' | 'monthly' | 'yearly') {
  if (period === 'weekly') {
    return `Week of ${formatDate(start.toISOString().split('T')[0])} – ${formatDate(end.toISOString().split('T')[0])}`;
  }
  if (period === 'yearly') {
    return `Year ${start.getFullYear()}`;
  }
  return `Month of ${start.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`;
}

export default function DuesReportArea({ transactions, members, referenceDate, period }: DuesReportAreaProps) {
  const report = useMemo(() => {
    const { start, end } = getPeriodBounds(referenceDate, period);
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);

    const dues = transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      return t.category === 'Dues' && d >= start && d <= endOfDay;
    });

    const total = dues.reduce((s, t) => s + Number(t.amount), 0);
    const contributorIds = new Set(dues.filter(t => t.member_id).map(t => t.member_id!));
    const paidMemberIds = new Set(dues.filter(t => t.member_id).map(t => t.member_id!));
    const activeMembers = members.filter(m => m.status === 'active');

    const memberBreakdown = activeMembers.map(m => {
      const mTxs = dues.filter(t => t.member_id === m.id);
      const totalPaid = mTxs.reduce((s, t) => s + Number(t.amount), 0);
      return { member: m, transactions: mTxs, totalPaid };
    }).filter(m => m.totalPaid > 0).sort((a, b) => b.totalPaid - a.totalPaid);

    const nonContributors = activeMembers.filter(m => !paidMemberIds.has(m.id));

    return { start, end, total, contributorCount: contributorIds.size, memberBreakdown, nonContributors };
  }, [transactions, members, referenceDate, period]);

  return (
    <Card className="p-10 md:p-14" id="dues-report-area">
      <div className="text-center pb-6 border-b-4 border-double border-slate-300 dark:border-slate-800 mb-8">
        <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">LOCAL CHURCH YOUTH FELLOWSHIP</h2>
        <h3 className="text-sm font-semibold tracking-widest text-slate-500 uppercase mt-1">DUES COLLECTION REPORT</h3>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
          {periodLabel(report.start, report.end, period)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Dues Collected</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(report.total)}</p>
        </div>
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Contributors</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{report.contributorCount} / {members.filter(m => m.status === 'active').length}</p>
        </div>
      </div>

      {report.memberBreakdown.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-sm font-bold uppercase border-b border-slate-900 dark:border-slate-100 pb-2 mb-4">Member Contributions</h3>
          <div className="text-xs">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border mb-2">
              <span>Member</span>
              <span className="text-right">Amount</span>
              <span className="text-right w-20">Method</span>
            </div>
            {report.memberBreakdown.map(({ member, transactions: txs, totalPaid }) => (
              <div key={member.id}>
                {txs.map((tx, i) => (
                  <div key={tx.id} className="grid grid-cols-[1fr_auto_auto] gap-2 py-1.5 border-b border-border/50">
                    <span>{i === 0 ? member.name : ''}</span>
                    <span className="text-right font-mono">{formatCurrency(tx.amount)}</span>
                    <span className="text-right w-20 text-muted-foreground">{tx.payment_method}</span>
                  </div>
                ))}
                <div className="grid grid-cols-[1fr_auto_auto] gap-2 py-1.5 font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/30">
                  <span className="pl-2">{member.name} Total</span>
                  <span className="text-right font-mono">{formatCurrency(totalPaid)}</span>
                  <span className="text-right w-20"></span>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 py-2 mt-2 border-t-2 border-slate-800 text-sm font-bold">
              <span>Grand Total</span>
              <span className="text-right text-emerald-600">{formatCurrency(report.total)}</span>
              <span className="text-right w-20"></span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-muted-foreground italic py-8">No dues were collected in this period.</p>
      )}

      {report.nonContributors.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">Members who did not contribute</h4>
          <p className="text-xs text-muted-foreground">{report.nonContributors.map(m => m.name).join(', ')}</p>
        </div>
      )}

      <div className="mt-16 grid grid-cols-2 gap-10 print-only">
        <div className="border-t border-slate-800 pt-3 text-center text-xs">
          <p className="font-bold">Prepared By:</p>
          <p className="mt-4">Fellowship Treasurer</p>
        </div>
        <div className="border-t border-slate-800 pt-3 text-center text-xs">
          <p className="font-bold">Approved By:</p>
          <p className="mt-4">Fellowship President</p>
        </div>
      </div>
    </Card>
  );
}
