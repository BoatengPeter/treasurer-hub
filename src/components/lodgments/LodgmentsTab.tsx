'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LodgmentTable from './LodgmentTable';

export default function LodgmentsTab() {
  const { setEditingLodgment, setLodgReceiptImage, setIsLodgeModalOpen } = useDashboardStore();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Deposit Lodgments</h2>
          <p className="text-xs text-muted-foreground">Log money lodged in the main church vault</p>
        </div>
        <Button onClick={() => { setEditingLodgment(null); setLodgReceiptImage(''); setIsLodgeModalOpen(true); }} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Record Lodgment
        </Button>
      </header>
      <LodgmentTable />
    </div>
  );
}
