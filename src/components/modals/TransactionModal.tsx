'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionFormSchema, type TransactionFormData } from '@/lib/validation';
import type { Transaction } from '@/lib/db';
import { useDashboardStore } from '@/stores/dashboard-store';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon, UserCheck } from 'lucide-react';
import DatePicker from '@/components/ui/DatePicker';

const getDefaultValues = (tx: Transaction | null): TransactionFormData => ({
  date: tx?.date ?? new Date().toISOString().split('T')[0],
  type: tx?.type ?? 'income',
  category: tx?.category ?? 'Offering',
  amount: tx?.amount ?? ('' as unknown as number),
  payment_method: tx?.payment_method ?? 'Cash',
  reference: tx?.reference ?? '',
  description: tx?.description ?? '',
  member_id: tx?.member_id ?? '',
  meeting_id: tx?.meeting_id ?? '',
  lodgment_id: tx?.lodgment_id ?? '',
  receipt_image: tx?.receipt_image ?? '',
});

const FormErr = ({ errors, field }: { errors: Record<string, { message?: string }>; field: keyof TransactionFormData }) => {
  const msg = errors[field]?.message;
  if (!msg) return null;
  return <p className="text-xs text-rose-500 mt-0.5">{msg as string}</p>;
};

export default function TransactionModal() {
  const isTxModalOpen = useDashboardStore(s => s.isTxModalOpen);
  const setIsTxModalOpen = useDashboardStore(s => s.setIsTxModalOpen);
  const editingTx = useDashboardStore(s => s.editingTx);
  const txReceiptImage = useDashboardStore(s => s.txReceiptImage);
  const setTxReceiptImage = useDashboardStore(s => s.setTxReceiptImage);
  const uploadingTxImage = useDashboardStore(s => s.uploadingTxImage);
  const setUploadingTxImage = useDashboardStore(s => s.setUploadingTxImage);
  const handleSaveTransaction = useDashboardStore(s => s.handleSaveTransaction);
  const uploadReceiptImage = useDashboardStore(s => s.uploadReceiptImage);
  const members = useDashboardStore(s => s.members);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: getDefaultValues(null),
    values: editingTx ? getDefaultValues(editingTx) : undefined,
  });

  const handleOpenChange = (open: boolean) => {
    setIsTxModalOpen(open);
    if (!open) reset(getDefaultValues(null));
  };

  const onSubmit = (data: TransactionFormData) => {
    data.receipt_image = txReceiptImage;
    handleSaveTransaction(data);
  };

  return (
    <Dialog open={isTxModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTx ? 'Modify Transaction Record' : 'Record Ledger Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Date</label>
              <Controller
                name="date"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <DatePicker name="date" value={value} onChange={onChange} required />
                )}
              />
              <FormErr errors={errors} field="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Type</label>
              <select
                {...register('type')}
                required
                className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
              >
                <option value="income">Income (Inflow)</option>
                <option value="expense">Expense (Outflow)</option>
              </select>
              <FormErr errors={errors} field="type" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Category</label>
              <select
                {...register('category')}
                required
                className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
              >
                <option value="Offering">Offering</option>
                <option value="Dues">Dues</option>
                <option value="Donation">Donation</option>
                <option value="Special Contribution">Special Contribution</option>
                <option value="Transport">Transport</option>
                <option value="Stationery">Stationery</option>
                <option value="Honorarium">Honorarium</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Amount (GHS)</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register('amount')}
              />
              <FormErr errors={errors} field="amount" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Payment Method</label>
              <select
                {...register('payment_method')}
                required
                className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
              >
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
                <option value="Mobile Money">Mobile Money (MoMo)</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Reference No. (optional)</label>
              <Input
                type="text"
                placeholder="Cheque #, TxID, receipt #"
                {...register('reference')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider">Description (optional)</label>
            <Textarea
              placeholder="Log context notes for this transaction..."
              {...register('description')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              Member (optional)
            </label>
            <select
              {...register('member_id')}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
            >
              <option value="">— Not linked to a member —</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-border pt-4 mt-2">
            <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-emerald-600" />
              Upload Receipt Image (optional)
            </label>
            <Input
              type="file"
              accept="image/*"
              disabled={uploadingTxImage}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadingTxImage(true);
                  const url = await uploadReceiptImage(file);
                  setTxReceiptImage(url);
                  setUploadingTxImage(false);
                }
              }}
              className="text-xs cursor-pointer"
            />
            {uploadingTxImage && (
              <p className="text-xs text-emerald-600 font-semibold animate-pulse mt-1">Uploading image file to storage...</p>
            )}
            {txReceiptImage && (
              <div className="mt-2 relative inline-block self-start">
                <Image src={txReceiptImage} alt="Receipt Preview" width={80} height={80} className="h-20 w-20 object-cover rounded border border-border" unoptimized />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
                  onClick={() => setTxReceiptImage('')}
                >
                  ✕
                </Button>
              </div>
            )}
          </div>

          <input type="hidden" {...register('meeting_id')} />
          <input type="hidden" {...register('lodgment_id')} />

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Record</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
