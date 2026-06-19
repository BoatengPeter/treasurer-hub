'use client';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format-utils';
import type { Transaction } from '@/lib/db';

interface ReportsPrintAreaProps {
  reportData: {
    totalIncome: number;
    totalExpense: number;
    incomeByCategory: Record<string, number>;
    expenseByCategory: Record<string, number>;
    netSurplus: number;
  };
  reportQuarter: string;
  reportYear: string;
  reportType: string;
}

export default function ReportsPrintArea({ reportData, reportQuarter, reportYear, reportType }: ReportsPrintAreaProps) {
  const quarterLabels: Record<string, string> = {
    Q1: 'Jan 1 - Mar 31', Q2: 'Apr 1 - Jun 30', Q3: 'Jul 1 - Sep 30', Q4: 'Oct 1 - Dec 31'
  };

  return (
    <Card className="p-10 md:p-14" id="printable-area">
      <div className="text-center pb-6 border-b-4 border-double border-slate-300 dark:border-slate-800 mb-8">
        <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">LOCAL CHURCH YOUTH FELLOWSHIP</h2>
        <h3 className="text-sm font-semibold tracking-widest text-slate-500 uppercase mt-1">TREASURER'S COMPLIANCE REPORT</h3>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">
          Quarter: {reportQuarter} - {reportYear} ({quarterLabels[reportQuarter]}, {reportYear})
        </p>
      </div>

      {(reportType === 'both' || reportType === 'receipts') && (
        <div className="mb-10 print-page-break">
          <h3 className="text-sm font-bold uppercase border-b border-slate-900 dark:border-slate-100 pb-2 mb-4">Receipts & Payments Statement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className="text-xs font-bold font-mono text-emerald-600 block pb-1 border-b border-dashed border-border mb-3">RECEIPTS (INFLOW)</span>
              <div className="flex flex-col gap-2 text-xs">
                {Object.entries(reportData.incomeByCategory).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between py-1 border-b border-border/50">
                    <span>{cat} Dues / Offerings</span>
                    <span>{formatCurrency(val)}</span>
                  </div>
                ))}
                {Object.keys(reportData.incomeByCategory).length === 0 && <span className="text-muted-foreground italic">No inflows logged.</span>}
                <div className="flex justify-between font-bold pt-3 border-t border-slate-800 text-slate-900 dark:text-slate-100 text-sm">
                  <span>Total Receipts:</span>
                  <span className="text-emerald-600">{formatCurrency(reportData.totalIncome)}</span>
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold font-mono text-rose-500 block pb-1 border-b border-dashed border-border mb-3">PAYMENTS (OUTFLOW)</span>
              <div className="flex flex-col gap-2 text-xs">
                {Object.entries(reportData.expenseByCategory).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between py-1 border-b border-border/50">
                    <span>{cat} Outflow</span>
                    <span>{formatCurrency(val)}</span>
                  </div>
                ))}
                {Object.keys(reportData.expenseByCategory).length === 0 && <span className="text-muted-foreground italic">No outflows logged.</span>}
                <div className="flex justify-between font-bold pt-3 border-t border-slate-800 text-slate-900 dark:text-slate-100 text-sm">
                  <span>Total Payments:</span>
                  <span className="text-rose-500">{formatCurrency(reportData.totalExpense)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-border text-xs flex justify-between font-bold">
            <span>Net Quarterly Balance Shift:</span>
            <span className={reportData.netSurplus >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
              {reportData.netSurplus >= 0 ? '+' : ''}{formatCurrency(reportData.netSurplus)}
            </span>
          </div>
        </div>
      )}

      {(reportType === 'both' || reportType === 'income') && (
        <div>
          <h3 className="text-sm font-bold uppercase border-b border-slate-900 dark:border-slate-100 pb-2 mb-4">Income & Expenditure Statement</h3>
          <div className="flex flex-col gap-6 text-xs">
            <div>
              <span className="font-semibold text-emerald-600 block mb-2 text-xs">INCOME REVENUES</span>
              <div className="flex flex-col gap-2 pl-4">
                {Object.entries(reportData.incomeByCategory).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between py-1 border-b border-border/50">
                    <span>{cat} Collections</span>
                    <span className="font-mono">{formatCurrency(val)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 text-slate-800 dark:text-slate-200">
                  <span>Total Revenues:</span>
                  <span className="font-mono">{formatCurrency(reportData.totalIncome)}</span>
                </div>
              </div>
            </div>
            <div>
              <span className="font-semibold text-rose-500 block mb-2 text-xs">EXPENDITURE CHARGES</span>
              <div className="flex flex-col gap-2 pl-4">
                {Object.entries(reportData.expenseByCategory).map(([cat, val]) => (
                  <div key={cat} className="flex justify-between py-1 border-b border-border/50">
                    <span>{cat} Expense</span>
                    <span className="font-mono">{formatCurrency(val)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 text-slate-800 dark:text-slate-200">
                  <span>Total Expenditures:</span>
                  <span className="font-mono">{formatCurrency(reportData.totalExpense)}</span>
                </div>
              </div>
            </div>
            <div className="border-t-2 border-b-2 border-slate-900 dark:border-slate-100 py-3 mt-4 flex justify-between font-bold text-sm">
              <span>QUARTERLY ACCUMULATED SURPLUS / (DEFICIT):</span>
              <span className={reportData.netSurplus >= 0 ? 'text-emerald-600' : 'text-rose-500'}>{formatCurrency(reportData.netSurplus)}</span>
            </div>
          </div>
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
