'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpButton from '@/components/ui/HelpButton';

export default function DashboardHeader() {
  const { setEditingMeeting, setTempSignature, setIsMeetModalOpen, setEditingTx, setTxReceiptImage, setIsTxModalOpen } = useDashboardStore();

  return (
    <header className="flex justify-between items-center gap-4 flex-wrap">
      <div>
        <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Financial Position</h2>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-xs text-muted-foreground">Compliance indicators and real-time ledger holdings</p>
          <HelpButton title="Financial Position">
            <p>This dashboard gives you a snapshot of the youth group&apos;s financial health. Key metrics show total income, expenses, and cash position at a glance.</p>
            <p><strong>What you can do here:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Review current balance and period totals</li>
              <li>Track compliance — are lodgments up to date?</li>
              <li>See recent meetings and pending deposits</li>
              <li>Quick-log a meeting or transaction from the header</li>
              <li>View the funds distribution chart for income sources</li>
            </ul>
          </HelpButton>
        </div>
      </div>
      <div className="no-print flex items-center gap-2">
        <Button variant="outline" onClick={() => { setEditingMeeting(null); setTempSignature(''); setIsMeetModalOpen(true); }}
          className="flex items-center gap-1.5">
          <Users className="h-4 w-4" /> Log Meeting
        </Button>
        <Button onClick={() => { setEditingTx(null); setTxReceiptImage(''); setIsTxModalOpen(true); }}
          className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Log Transaction
        </Button>
      </div>
    </header>
  );
}
