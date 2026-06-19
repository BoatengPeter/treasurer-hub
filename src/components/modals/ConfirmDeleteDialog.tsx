'use client';

import { useState, useCallback } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TriangleAlert } from 'lucide-react';

const entityLabels: Record<string, string> = {
  transaction: 'Transaction',
  meeting: 'Meeting',
  lodgment: 'Lodgment',
  statement: 'Statement',
  member: 'Member',
};

export default function ConfirmDeleteDialog() {
  const { confirmDelete, setConfirmDelete, user, handleDeleteTx, handleDeleteMeeting, handleDeleteLodgment, handleDeleteStatement, handleDeleteMember } = useDashboardStore();
  const [typedEmail, setTypedEmail] = useState('');
  const [error, setError] = useState('');

  const entity = confirmDelete?.entity || '';
  const label = entityLabels[entity] || 'Record';

  const handleConfirm = useCallback(async () => {
    if (typedEmail !== user?.email) {
      setError('Email does not match. Type your email to confirm.');
      return;
    }
    setError('');

    const handlers: Record<string, (id: string) => Promise<void>> = {
      transaction: handleDeleteTx,
      meeting: handleDeleteMeeting,
      lodgment: handleDeleteLodgment,
      statement: handleDeleteStatement,
      member: handleDeleteMember,
    };

    const handler = handlers[entity];
    if (handler) {
      await handler(confirmDelete!.id);
    }
    setTypedEmail('');
  }, [typedEmail, user?.email, entity, confirmDelete, handleDeleteTx, handleDeleteMeeting, handleDeleteLodgment, handleDeleteStatement, handleDeleteMember]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmDelete(null);
      setTypedEmail('');
      setError('');
    }
  };

  return (
    <AlertDialog open={!!confirmDelete} onOpenChange={handleOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlert className="text-rose-500" />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete {label}</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Type your email <strong>{user?.email}</strong> to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="px-1">
          <Input
            placeholder={user?.email || ''}
            value={typedEmail}
            onChange={(e) => { setTypedEmail(e.target.value); setError(''); }}
            className={error ? 'border-rose-500' : ''}
          />
          {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
