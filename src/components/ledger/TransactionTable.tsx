'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, ImageIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/format-utils';
import type { Transaction } from '@/lib/db';

interface TransactionTableProps {
  filteredTransactions: Transaction[];
}

export default function TransactionTable({ filteredTransactions }: TransactionTableProps) {
  const { setEditingTx, setTxReceiptImage, setIsTxModalOpen, handleDeleteTx, setPreviewImage } = useDashboardStore();

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Vault Lodged</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="no-print text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.date}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                    {t.type === 'income' ? 'IN' : 'OUT'}
                  </span>
                </TableCell>
                <TableCell className="font-semibold">{t.category}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{t.reference || '-'}</TableCell>
                <TableCell className="max-w-[200px] truncate" title={t.description}>{t.description}</TableCell>
                <TableCell className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </TableCell>
                <TableCell>
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-800 dark:text-slate-200">{t.payment_method}</span>
                </TableCell>
                <TableCell>
                  {t.type === 'expense' ? (
                    <span className="text-[10px] text-muted-foreground">N/A</span>
                  ) : t.lodgment_id ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-medium">Lodged</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-medium">Pending</span>
                  )}
                </TableCell>
                <TableCell>
                  {t.receipt_image ? (
                    <button type="button" onClick={() => setPreviewImage(t.receipt_image || '')}
                      className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-xs cursor-pointer font-semibold">
                      <ImageIcon className="h-3.5 w-3.5" /> <span>View</span>
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="no-print text-right">
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingTx(t); setTxReceiptImage(t.receipt_image || ''); setIsTxModalOpen(true); }}
                      className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTx(t.id)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredTransactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-muted-foreground text-sm">No transactions match your search filter.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
