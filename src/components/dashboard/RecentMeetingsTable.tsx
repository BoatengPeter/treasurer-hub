'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import type { Meeting } from '@/lib/db';
import { formatCurrency } from '@/lib/format-utils';

interface RecentMeetingsTableProps {
  meetings: Meeting[];
  onViewAll: () => void;
}

export default function RecentMeetingsTable({ meetings, onViewAll }: RecentMeetingsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Recent Meeting Collections</CardTitle>
          <CardDescription>Signed dues and offerings summaries</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="h-8">View All</Button>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Fellowship Meeting</TableHead>
              <TableHead>Dues</TableHead>
              <TableHead>Offering</TableHead>
              <TableHead>Total Sum</TableHead>
              <TableHead>Sign-off</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.slice(0, 3).map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-mono text-xs">{m.date}</TableCell>
                <TableCell className="font-semibold">{m.title}</TableCell>
                <TableCell>{formatCurrency(m.dues_collected)}</TableCell>
                <TableCell>{formatCurrency(m.offering_collected)}</TableCell>
                <TableCell className="font-bold text-emerald-600">{formatCurrency(m.total_collected)}</TableCell>
                <TableCell>
                  {m.president_signature ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                      <img src={m.president_signature} alt="Sig" className="h-5 max-w-[60px] object-contain" />
                      <span>✓ Signed</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-600 font-semibold">Pending</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {meetings.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-6 text-sm">
                  No meetings registered.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
