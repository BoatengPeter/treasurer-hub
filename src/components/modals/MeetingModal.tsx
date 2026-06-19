'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SignaturePad from '@/components/SignaturePad';
import { UserCheck } from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';

export default function MeetingModal() {
  const {
    isMeetModalOpen, setIsMeetModalOpen,
    editingMeeting, setTempSignature,
    handleSaveMeeting, members,
  } = useDashboardStore();

  const [linkMembers, setLinkMembers] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [perMemberAmount, setPerMemberAmount] = useState('5');
  const [meetingDate, setMeetingDate] = useState(editingMeeting?.date || new Date().toISOString().split('T')[0]);

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
              <DatePicker name="date" value={meetingDate} onChange={setMeetingDate} required />
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

          {!editingMeeting && (
            <div className="border-t border-border pt-4">
              <button type="button" onClick={() => setLinkMembers(!linkMembers)}
                className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 hover:underline cursor-pointer">
                <UserCheck className="h-4 w-4" /> {linkMembers ? 'Hide' : 'Link'} Member Payments to this Meeting
              </button>
              {linkMembers && (
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Amount per member (GHS):</label>
                    <Input type="number" step="0.01" min="0.01" value={perMemberAmount}
                      onChange={e => setPerMemberAmount(e.target.value)} className="h-8 text-sm max-w-[120px]" />
                  </div>
                  <div className="max-h-[150px] overflow-y-auto border border-border rounded-md p-2 space-y-1">
                    {members.filter(m => m.status === 'active').map(m => (
                      <label key={m.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1 rounded">
                        <input type="checkbox" checked={selectedMemberIds.includes(m.id)}
                          onChange={() => setSelectedMemberIds(prev =>
                            prev.includes(m.id) ? prev.filter(i => i !== m.id) : [...prev, m.id]
                          )} className="h-4 w-4 accent-emerald-600" />
                        {m.name}
                      </label>
                    ))}
                    {members.filter(m => m.status === 'active').length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-2">No active members. Add members first.</p>
                    )}
                  </div>
                  {selectedMemberIds.length > 0 && (
                    <p className="text-xs text-emerald-600 font-medium">
                      {selectedMemberIds.length} member(s) × GHS {parseFloat(perMemberAmount || '0').toFixed(2)} = GHS {(selectedMemberIds.length * parseFloat(perMemberAmount || '0')).toFixed(2)}
                    </p>
                  )}
                  <input type="hidden" name="link_member_ids" value={JSON.stringify(selectedMemberIds)} />
                  <input type="hidden" name="link_member_amount" value={perMemberAmount} />
                </div>
              )}
            </div>
          )}

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
