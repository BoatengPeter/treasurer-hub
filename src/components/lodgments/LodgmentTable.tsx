'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format-utils';

export default function LodgmentTable() {
  const { lodgments, setEditingLodgment, setLodgReceiptImage, setIsLodgeModalOpen, handleDeleteLodgment, setPreviewImage } = useDashboardStore();

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deposit Date</TableHead>
              <TableHead>Amount Deposited</TableHead>
              <TableHead>Official Receipt No.</TableHead>
              <TableHead>Receiving Church Treasurer</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipt Image</TableHead>
              <TableHead className="no-print text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lodgments.map(l => (
              <TableRow key={l.id}>
                <TableCell className="font-mono text-xs">{l.date}</TableCell>
                <TableCell className="font-bold text-emerald-600">{formatCurrency(l.amount)}</TableCell>
                <TableCell className="font-mono font-semibold text-xs">{l.church_receipt_no}</TableCell>
                <TableCell>{l.treasurer_name}</TableCell>
                <TableCell>{l.notes || '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${l.status === 'Reconciled' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    {l.status}
                  </span>
                </TableCell>
                <TableCell>
                  {l.receipt_image ? (
                    <button type="button" onClick={() => setPreviewImage(l.receipt_image || '')}
                      className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-xs cursor-pointer font-semibold">
                      <ImageIcon className="h-3.5 w-3.5" /> <span>View</span>
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="no-print text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingLodgment(l); setLodgReceiptImage(l.receipt_image || ''); setIsLodgeModalOpen(true); }} className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteLodgment(l.id)} className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {lodgments.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground text-sm">No lodgment deposits recorded yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
