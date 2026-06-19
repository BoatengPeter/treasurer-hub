'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpButton from '@/components/ui/HelpButton';
import { Card } from '@/components/ui/card';
import MeetingCard from './MeetingCard';

export default function MeetingsTab() {
  const { meetings, setEditingMeeting, setTempSignature, setIsMeetModalOpen } = useDashboardStore();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Fellowship Sign-offs</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-xs text-muted-foreground">Gather signature approvals for meeting collections in real-time</p>
            <HelpButton title="Fellowship Sign-offs">
              <p>Each youth fellowship meeting collects dues, offerings, and other contributions. This section records those collections and captures the president&apos;s digital signature as acknowledgement.</p>
              <p><strong>What you can do here:</strong></p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Log a new meeting with collection amounts</li>
                <li>Capture the president&apos;s signature on a signature pad</li>
                <li>Link individual member payments to a meeting</li>
                <li>Review past meetings and their signed-off records</li>
                <li>Edit or delete existing meeting records</li>
              </ul>
            </HelpButton>
          </div>
        </div>
        <Button onClick={() => { setEditingMeeting(null); setTempSignature(''); setIsMeetModalOpen(true); }} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Log Meeting
        </Button>
      </header>
      <div className="flex flex-col gap-6">
        {meetings.map(m => <MeetingCard key={m.id} meeting={m} />)}
        {meetings.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground text-sm">
            No service records logged yet. Use the button to log your first meeting collections and collect approval.
          </Card>
        )}
      </div>
    </div>
  );
}
