'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';

export default function ReceiptPreview() {
  const { previewImage, setPreviewImage } = useDashboardStore();

  return (
    <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage('')}>
      <DialogContent className="max-w-[700px] flex flex-col items-center justify-center p-6">
        <DialogHeader className="w-full">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-emerald-600" /> Receipt Photo Review
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 border border-border rounded-lg overflow-hidden bg-white max-h-[60vh] flex justify-center items-center w-full shadow-inner p-2">
          <img src={previewImage} alt="Receipt Preview Fullscreen" className="max-w-full max-h-[50vh] object-contain rounded" />
        </div>
        <DialogFooter className="w-full mt-4 flex justify-between items-center gap-4 flex-wrap">
          <Button variant="outline" onClick={() => setPreviewImage('')}>Close Preview</Button>
          {previewImage.startsWith('data:') && (
            <a href={previewImage} download={`receipt_upload_${new Date().toISOString().split('T')[0]}.jpg`}>
              <Button><Download className="h-4 w-4 mr-2" /> Download Photo</Button>
            </a>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
