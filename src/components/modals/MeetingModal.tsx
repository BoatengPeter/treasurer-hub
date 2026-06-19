'use client';

import { useDashboardStore } from '@/stores/dashboard-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SignaturePad from '@/components/SignaturePad';

export default function MeetingModal() {
  const {
    isMeetModalOpen, setIsMeetModalOpen,
    editingMeeting, setTempSignature,
    handleSaveMeeting,
  } = useDashboardStore();

  return (
    <Dialog open={isMeetModalOpen} onOpenChange={setIsMeetModalOpen}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingMeeting ? 'Fellowship Review & Sign-off' : 'Log Weekly Meeting collections'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveMeeting} className="flex flex-col gap-4 py-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Meeting Date</label>
              <Input
                type="date"
                name="date"
                required
                defaultValue={editingMeeting?.date || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Meeting Title</label>
              <Input
                type="text"
                name="title"
                required
                placeholder="Weekly fellowship, Joint service"
                defaultValue={editingMeeting?.title || 'Weekly Youth Fellowship'}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Dues (GHS)</label>
              <Input
                type="number"
                step="0.01"
                name="dues_collected"
                placeholder="0.00"
                defaultValue={editingMeeting?.dues_collected || ''}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Offering (GHS)</label>
              <Input
                type="number"
                step="0.01"
                name="offering_collected"
                placeholder="0.00"
                defaultValue={editingMeeting?.offering_collected || ''}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Other (GHS)</label>
              <Input
                type="number"
                step="0.01"
                name="other_collected"
                placeholder="0.00"
                defaultValue={editingMeeting?.other_collected || ''}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider">Remarks / Notes</label>
            <Textarea
              name="notes"
              placeholder="Fellowship sermon topic, speakers, attendance logs..."
              defaultValue={editingMeeting?.notes || ''}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider">President Full Name</label>
            <Input
              type="text"
              name="president_name"
              required
              placeholder="David Mensah"
              defaultValue={editingMeeting?.president_name || ''}
            />
          </div>

          <div className="mt-2">
            <SignaturePad
              value={editingMeeting?.president_signature}
              onSave={(dataUrl) => setTempSignature(dataUrl)}
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsMeetModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Meeting Logs</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
