'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import MeetingCard from './MeetingCard';

export default function MeetingsTab() {
  const { meetings, setEditingMeeting, setTempSignature, setIsMeetModalOpen } = useDashboardStore();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Fellowship Sign-offs</h2>
          <p className="text-xs text-muted-foreground">Gather signature approvals for meeting collections in real-time</p>
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
