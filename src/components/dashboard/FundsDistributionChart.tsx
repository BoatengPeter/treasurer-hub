'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FundsDistributionChartProps {
  metrics: {
    totalIncome: number;
    totalLodged: number;
    pendingLodgmentAmount: number;
    totalExpense: number;
  };
}

export default function FundsDistributionChart({ metrics }: FundsDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Funds Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center flex-col py-6">
        {metrics.totalIncome > 0 ? (
          <div className="w-full flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Deposited in Vault</span>
                <span>{((metrics.totalLodged / metrics.totalIncome) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600" style={{ width: `${(metrics.totalLodged / metrics.totalIncome) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Pending Deposit</span>
                <span>{((metrics.pendingLodgmentAmount / metrics.totalIncome) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${(metrics.pendingLodgmentAmount / metrics.totalIncome) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Operational Outflow</span>
                <span>{((metrics.totalExpense / metrics.totalIncome) * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500" style={{ width: `${(metrics.totalExpense / metrics.totalIncome) * 100}%` }}></div>
              </div>
            </div>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground py-6">No data registered.</span>
        )}
      </CardContent>
    </Card>
  );
}
