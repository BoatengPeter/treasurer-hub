'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Database, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StatusBanner() {
  const { supabaseConnected, loadAllData } = useDashboardStore();
  return (
    <div className="no-print mb-6 p-4 rounded-lg bg-card border border-border flex items-center justify-between text-xs font-medium">
      <div className="flex items-center gap-2">
        <Database className={`h-4 w-4 ${supabaseConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
        <span>
          {supabaseConnected
            ? 'Cloud sync enabled. All records are securely synchronized.'
            : 'Supabase cloud is not available. Check your connection.'}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={loadAllData} className="h-7 px-2">
        <RefreshCw className="h-3 w-3 mr-1" /> Sync
      </Button>
    </div>
  );
}
