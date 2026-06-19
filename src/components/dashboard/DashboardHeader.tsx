'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Users, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardHeader() {
  const { setEditingMeeting, setTempSignature, setIsMeetModalOpen, setEditingTx, setTxReceiptImage, setIsTxModalOpen } = useDashboardStore();

  return (
    <header className="flex justify-between items-center gap-4 flex-wrap">
      <div>
        <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Financial Position</h2>
        <p className="text-xs text-muted-foreground">Compliance indicators and real-time ledger holdings</p>
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
