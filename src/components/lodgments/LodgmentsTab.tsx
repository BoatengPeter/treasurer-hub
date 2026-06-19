'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpButton from '@/components/ui/HelpButton';
import LodgmentTable from './LodgmentTable';

export default function LodgmentsTab() {
  const { setEditingLodgment, setLodgReceiptImage, setIsLodgeModalOpen } = useDashboardStore();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Deposit Lodgments</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-muted-foreground">Log money lodged in the main church vault</p>
            <HelpButton title="Deposit Lodgments">
              <p>When income collected from meetings or other sources is deposited into the main church vault, it is recorded here as a lodgment. This tracks the movement of funds from the youth group to the church treasury.</p>
              <p><strong>What you can do here:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Record a new lodgment with receipt number and amount</li>
                <li>Upload a photo of the deposit receipt</li>
                <li>Track lodgment status — Pending, Lodged, or Reconciled</li>
                <li>Edit or delete existing lodgment records</li>
              </ul>
            </HelpButton>
          </div>
        </div>
        <Button onClick={() => { setEditingLodgment(null); setLodgReceiptImage(''); setIsLodgeModalOpen(true); }} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Record Lodgment
        </Button>
      </header>
      <LodgmentTable />
    </div>
  );
}
