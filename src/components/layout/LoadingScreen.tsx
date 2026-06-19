'use client';
import { RefreshCw } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <RefreshCw className="h-10 w-10 text-emerald-600 animate-spin" />
      <p className="text-sm font-semibold text-muted-foreground">Syncing transaction registry...</p>
    </div>
  );
}
