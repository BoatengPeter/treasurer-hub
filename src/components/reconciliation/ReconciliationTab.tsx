'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/format-utils';
import VarianceChecker from './VarianceChecker';

export default function ReconciliationTab() {
  const { statements, lodgments, setEditingStatement, setIsStmtModalOpen, handleDeleteStatement } = useDashboardStore();

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Account Reconciliation</h2>
          <p className="text-xs text-muted-foreground">Compare official statements called from the church treasurer</p>
        </div>
        <Button onClick={() => { setEditingStatement(null); setIsStmtModalOpen(true); }} className="flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Log Church Statement
        </Button>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Logged Statements Registry</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Opening Bal</TableHead>
                    <TableHead>Closing Bal</TableHead>
                    <TableHead>Vault Lodgments</TableHead>
                    <TableHead className="no-print text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statements.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="font-semibold text-xs">{formatDate(s.period_start)} - {formatDate(s.period_end)}</TableCell>
                      <TableCell>{s.statement_type}</TableCell>
                      <TableCell>{formatCurrency(s.opening_balance)}</TableCell>
                      <TableCell className="font-bold text-emerald-600">{formatCurrency(s.closing_balance)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(s.lodgments_recorded)}</TableCell>
                      <TableCell className="no-print text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => { setEditingStatement(s); setIsStmtModalOpen(true); }} className="h-7 w-7 p-0"><Edit className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteStatement(s.id)} className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {statements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">No statement sheets registered yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <VarianceChecker statements={statements} lodgments={lodgments} />
      </div>
    </div>
  );
}
