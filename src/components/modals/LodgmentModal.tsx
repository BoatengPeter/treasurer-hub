'use client';

import { useDashboardStore } from '@/stores/dashboard-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageIcon } from 'lucide-react';

export default function LodgmentModal() {
  const {
    isLodgeModalOpen, setIsLodgeModalOpen,
    editingLodgment, setEditingLodgment,
    lodgReceiptImage, setLodgReceiptImage,
    uploadingLodgImage, setUploadingLodgImage,
    handleSaveLodgment, uploadReceiptImage,
  } = useDashboardStore();

  return (
    <Dialog open={isLodgeModalOpen} onOpenChange={setIsLodgeModalOpen}>
      <DialogContent className="max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingLodgment ? 'Modify Deposit Record' : 'Record Deposit Lodgment'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSaveLodgment} className="flex flex-col gap-4 py-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Date of Deposit</label>
              <Input
                type="date"
                name="date"
                required
                defaultValue={editingLodgment?.date || new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Amount Lodged (GHS)</label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                name="amount"
                required
                placeholder="0.00"
                defaultValue={editingLodgment?.amount || ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Church official Receipt #</label>
              <Input
                type="text"
                name="church_receipt_no"
                required
                placeholder="CH-REC-00123"
                defaultValue={editingLodgment?.church_receipt_no || ''}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider">Receiving Treasurer Name</label>
              <Input
                type="text"
                name="treasurer_name"
                required
                placeholder="Elder Comfort Appiah"
                defaultValue={editingLodgment?.treasurer_name || ''}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider">Verification Status</label>
            <select
              name="status"
              defaultValue={editingLodgment?.status || 'Lodged'}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1"
            >
              <option value="Pending">Pending Verification</option>
              <option value="Lodged">Lodged (Confirmed with Receipt)</option>
              <option value="Reconciled">Reconciled (Appears on Church Statement)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider">Notes / Remarks</label>
            <Textarea
              name="notes"
              placeholder="Any special remarks..."
              defaultValue={editingLodgment?.notes || ''}
            />
          </div>

          <div className="flex flex-col gap-1.5 border-t border-border pt-4 mt-2">
            <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-emerald-600" />
              Upload Church Receipt Image (optional)
            </label>
            <Input
              type="file"
              accept="image/*"
              disabled={uploadingLodgImage}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadingLodgImage(true);
                  const url = await uploadReceiptImage(file);
                  setLodgReceiptImage(url);
                  setUploadingLodgImage(false);
                }
              }}
              className="text-xs cursor-pointer"
            />
            {uploadingLodgImage && (
              <p className="text-xs text-emerald-600 font-semibold animate-pulse mt-1">Uploading image file to storage...</p>
            )}
            {lodgReceiptImage && (
              <div className="mt-2 relative inline-block self-start">
                <img src={lodgReceiptImage} alt="Receipt Preview" className="h-20 w-20 object-cover rounded border border-border" />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
                  onClick={() => setLodgReceiptImage('')}
                >
                  ✕
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsLodgeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Deposit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
