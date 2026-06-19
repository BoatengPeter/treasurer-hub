'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format-utils';
import type { ChurchStatement, Lodgment } from '@/lib/db';

interface VarianceCheckerProps {
  statements: ChurchStatement[];
  lodgments: Lodgment[];
}

export default function VarianceChecker({ statements, lodgments }: VarianceCheckerProps) {
  if (statements.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">Auto-Variance Checker</CardTitle></CardHeader>
        <CardContent>
          <p className="text-xs text-center text-muted-foreground py-10">Log a statement to trigger auto-reconciliation analysis.</p>
        </CardContent>
      </Card>
    );
  }

  const endLimit = new Date(statements[0].period_end);
  const appDeposits = lodgments
    .filter(l => new Date(l.date) <= endLimit)
    .reduce((sum, l) => sum + Number(l.amount), 0);
  const diff = appDeposits - statements[0].lodgments_recorded;
  const isMatch = Math.abs(diff) < 0.01;

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Auto-Variance Checker</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <p className="text-xs text-muted-foreground">
            Comparing the statement period ending <strong>{formatDate(statements[0].period_end)}</strong> with app deposits logged up to that date:
          </p>
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-lg border border-border flex flex-col gap-3">
            <div className="flex justify-between text-xs font-semibold">
              <span>Statement Recorded:</span>
              <span>{formatCurrency(statements[0].lodgments_recorded)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold pb-2 border-b border-border">
              <span>Ledger Recorded:</span>
              <span>{formatCurrency(appDeposits)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-1">
              <span>Variance:</span>
              <span className={isMatch ? 'text-emerald-600' : 'text-rose-500'}>
                {isMatch ? 'Balanced' : formatCurrency(diff)}
              </span>
            </div>
            <div className="mt-4">
              {isMatch ? (
                <span className="w-full text-center text-xs font-medium text-emerald-600 bg-emerald-500/10 py-2 rounded block">✓ Balanced & Reconciled!</span>
              ) : (
                <div className="p-3 text-[11px] border border-rose-500/20 text-rose-500 bg-rose-500/10 rounded">
                  ⚠️ Variance detected. Check receipt book entries or bank details.
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
