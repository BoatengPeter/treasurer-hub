'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Meeting, ChurchStatement } from '@/lib/db';
import { FileCheck } from 'lucide-react';

interface ComplianceChecklistProps {
  metrics: { cashOnHand: number };
  meetings: Meeting[];
  statements: ChurchStatement[];
}

export default function ComplianceChecklist({ metrics, meetings, statements }: ComplianceChecklistProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-emerald-600" />
          Compliance Audit Checklist
        </CardTitle>
        <CardDescription>Verify operational alignment with your 7 treasurer duties</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex justify-between items-center pb-3 border-b border-border">
          <div>
            <p className="text-sm font-semibold">Rule i: Collect but Do Not Keep Funds</p>
            <p className="text-[11px] text-muted-foreground">Keep operational cash minimal. Vault deposits should exceed operational holdings.</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${metrics.cashOnHand > 500 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
            {metrics.cashOnHand > 500 ? 'High Cash: Lodge' : 'Compliant'}
          </span>
        </div>

        <div className="flex justify-between items-center pb-3 border-b border-border">
          <div>
            <p className="text-sm font-semibold">Rule iv: President Meeting Sign-offs</p>
            <p className="text-[11px] text-muted-foreground">Verify that the president has signed off on the collected sums of all services.</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${meetings.some(m => !m.president_signature) ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
            {meetings.some(m => !m.president_signature) ? 'Pending Signatures' : 'Compliant'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-semibold">Rule vii: periodic Statements called</p>
            <p className="text-[11px] text-muted-foreground">Upload and reconcile the church treasurer statements against your records.</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statements.length === 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
            {statements.length === 0 ? 'Request Statement' : 'Statements logged'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
