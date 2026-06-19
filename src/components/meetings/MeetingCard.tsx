'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import Image from 'next/image';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/format-utils';
import type { Meeting } from '@/lib/db';

interface MeetingCardProps {
  meeting: Meeting;
}

export default function MeetingCard({ meeting }: MeetingCardProps) {
  const { setEditingMeeting, setTempSignature, setIsMeetModalOpen, handleDeleteMeeting } = useDashboardStore();
  const m = meeting;

  return (
    <Card key={m.id}>
      <CardHeader className="flex flex-row justify-between items-center pb-4 border-b border-border flex-wrap gap-4">
        <div>
          <CardTitle className="text-lg">{m.title}</CardTitle>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5">
            <Calendar className="h-3.5 w-3.5" /> {formatDate(m.date)}
          </p>
        </div>
        <div className="no-print flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => { setEditingMeeting(m); setTempSignature(m.president_signature); setIsMeetModalOpen(true); }}>
            <Edit className="h-3.5 w-3.5 mr-1" /> Edit Info
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleDeleteMeeting(m.id)}
            className="bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Collections Breakdown</h4>
            <div className="flex justify-between items-center py-2 border-b border-border text-sm">
              <span>Fellowship Offering:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(m.offering_collected)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border text-sm">
              <span>Weekly Member Dues:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(m.dues_collected)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border text-sm">
              <span>Special Contribution:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(m.other_collected)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 text-base font-bold">
              <span>Total Collected Sum:</span>
              <span className="text-emerald-600">{formatCurrency(m.total_collected)}</span>
            </div>
          </div>
          <div className="flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-border pt-6 md:pt-0 md:pl-8">
            {m.president_signature ? (
              <div className="text-center w-full max-w-[280px]">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">Acknowledgement Sign-off</span>
                <div className="border border-border rounded-lg p-3 bg-white flex justify-center items-center max-h-[100px]">
                  <Image src={m.president_signature} alt="President Signature" width={280} height={80} className="max-h-[80px] object-contain" unoptimized />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Signed by <strong>{m.president_name}</strong> on {formatDate(m.signed_at || m.created_at || '')}</p>
              </div>
            ) : (
              <div className="text-center no-print">
                <p className="text-sm font-semibold text-amber-600 mb-3">⚠️ Pending President Signature</p>
                <Button onClick={() => { setEditingMeeting(m); setTempSignature(''); setIsMeetModalOpen(true); }}
                  size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">Provide Signature</Button>
              </div>
            )}
          </div>
        </div>
        {m.notes && (
          <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 text-xs border border-border">
            <strong>Service notes:</strong> {m.notes}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
