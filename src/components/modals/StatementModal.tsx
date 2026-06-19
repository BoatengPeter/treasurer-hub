'use client';

import { useDashboardStore } from '@/stores/dashboard-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function StatementModal() {
  const {
    isStmtModalOpen, setIsStmtModalOpen,
    editingStatement, setEditingStatement,
    handleSaveStatement,
  } = useDashboardStore();

  return (
    <Dialog open={isStmtModalOpen} onOpenChange={setIsStmtModalOpen}>
      <DialogContent className="max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{editingStatement ? 'Edit Church Statement Record' : 'Log Official Church Statement'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveStatement} className="flex flex-col gap-4 py-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Period Start Date</label>
              <Input
                type="date"
                name="period_start"
                required
                defaultValue={editingStatement?.period_start || ''}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Period End Date</label>
              <Input
                type="date"
                name="period_end"
                required
                defaultValue={editingStatement?.period_end || ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Statement Type</label>
              <select
                name="statement_type"
                required
                defaultValue={editingStatement?.statement_type || 'Monthly'}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Opening Balance (GHS)</label>
              <Input
                type="number"
                step="0.01"
                name="opening_balance"
                required
                placeholder="0.00"
                defaultValue={editingStatement?.opening_balance || ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Closing Balance (GHS)</label>
              <Input
                type="number"
                step="0.01"
                name="closing_balance"
                required
                placeholder="0.00"
                defaultValue={editingStatement?.closing_balance || ''}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Recorded Lodgments (GHS)</label>
              <Input
                type="number"
                step="0.01"
                name="lodgments_recorded"
                required
                placeholder="Total deposits on this statement"
                defaultValue={editingStatement?.lodgments_recorded || ''}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider">Notes / Remarks</label>
            <Textarea
              name="notes"
              placeholder="Audit verification details..."
              defaultValue={editingStatement?.notes || ''}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsStmtModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Statement</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
