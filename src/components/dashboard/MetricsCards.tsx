'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DollarSign, Building, TrendingUp, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/format-utils';

interface MetricsCardsProps {
  metrics: {
    totalIncome: number;
    totalExpense: number;
    totalLodged: number;
    pendingLodgmentAmount: number;
    cashOnHand: number;
    netBalance: number;
  };
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="stats-glow-primary border-l-4 border-l-emerald-600">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Total Youth Balance</span>
          <DollarSign className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(metrics.netBalance)}</div>
          <p className="text-[10px] text-muted-foreground mt-1">Accumulated ledger holdings surplus</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-emerald-700">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Lodged in Vault</span>
          <Building className="h-4 w-4 text-emerald-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(metrics.totalLodged)}</div>
          <p className="text-[10px] text-muted-foreground mt-1">Lodged and reconciled with church treasurer</p>
        </CardContent>
      </Card>

      <Card className="stats-glow-accent border-l-4 border-l-amber-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Deposit</span>
          <TrendingUp className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">{formatCurrency(metrics.pendingLodgmentAmount)}</div>
          <p className="text-[10px] text-muted-foreground mt-1">Collected income pending lodgment</p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-slate-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Operational Held</span>
          <ArrowUpRight className="h-4 w-4 text-slate-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(metrics.cashOnHand)}</div>
          <p className="text-[10px] text-muted-foreground mt-1">Funds held locally for petty expenses</p>
        </CardContent>
      </Card>
    </div>
  );
}
