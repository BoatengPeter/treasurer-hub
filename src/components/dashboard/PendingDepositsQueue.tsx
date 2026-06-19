'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Transaction } from '@/lib/db';
import { formatCurrency } from '@/lib/format-utils';

interface PendingDepositsQueueProps {
  transactions: Transaction[];
}

export default function PendingDepositsQueue({ transactions }: PendingDepositsQueueProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Pending Deposits Queue</CardTitle>
        <CardDescription>Income collections waiting to be lodged in church</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {transactions
          .filter(t => t.type === 'income' && !t.lodgment_id)
          .slice(0, 4)
          .map(t => (
            <div key={t.id} className="flex justify-between items-center p-3 rounded-lg border border-border bg-slate-50/50 dark:bg-slate-900/30 text-xs">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{t.category} - {t.reference || 'No Ref'}</p>
                <p className="text-[10px] text-muted-foreground">{t.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">{formatCurrency(t.amount)}</p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium mt-0.5 inline-block">Pending</span>
              </div>
            </div>
          ))
        }
        {transactions.filter(t => t.type === 'income' && !t.lodgment_id).length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-6">
            All income lodged! 100% compliance.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
