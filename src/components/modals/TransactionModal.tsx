'use client';

import { useDashboardStore } from '@/stores/dashboard-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon } from 'lucide-react';

export default function TransactionModal() {
  const {
    isTxModalOpen, setIsTxModalOpen,
    editingTx,
    txReceiptImage, setTxReceiptImage,
    uploadingTxImage, setUploadingTxImage,
    handleSaveTransaction, uploadReceiptImage,
  } = useDashboardStore();

  return (
    <Dialog open={isTxModalOpen} onOpenChange={setIsTxModalOpen}>
      <DialogContent className="max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTx ? 'Modify Transaction Record' : 'Record Ledger Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveTransaction} className="flex flex-col gap-4 py-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Date</label>
              <Input
                type="date"
                name="date"
                required
                defaultValue={editingTx?.date || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Type</label>
              <select
                name="type"
                required
                defaultValue={editingTx?.type || 'income'}
                className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
              >
                <option value="income">Income (Inflow)</option>
                <option value="expense">Expense (Outflow)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Category</label>
              <select
                name="category"
                required
                defaultValue={editingTx?.category || 'Offering'}
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
                name="amount"
                required
                placeholder="0.00"
                defaultValue={editingTx?.amount || ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Payment Method</label>
              <select
                name="payment_method"
                required
                defaultValue={editingTx?.payment_method || 'Cash'}
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
                name="reference"
                placeholder="Cheque #, TxID, receipt #"
                defaultValue={editingTx?.reference || ''}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider">Description</label>
            <Textarea
              name="description"
              required
              placeholder="Log context notes for this transaction..."
              defaultValue={editingTx?.description || ''}
            />
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
                <img src={txReceiptImage} alt="Receipt Preview" className="h-20 w-20 object-cover rounded border border-border" />
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

          <input type="hidden" name="meeting_id" defaultValue={editingTx?.meeting_id || ''} />
          <input type="hidden" name="lodgment_id" defaultValue={editingTx?.lodgment_id || ''} />

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsTxModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Record</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
