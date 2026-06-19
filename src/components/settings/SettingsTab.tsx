'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as db from '@/lib/db';

export default function SettingsTab() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Portal Settings</h2>
        <p className="text-xs text-muted-foreground">Application configuration</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connection</CardTitle>
            <CardDescription>Supabase credentials are configured via environment variables.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <span className={`h-2 w-2 rounded-full ${db.getSupabaseStatus() ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              {db.getSupabaseStatus() ? 'Connected to Supabase' : 'Not connected'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data</CardTitle>
            <CardDescription>All data is saved to Supabase cloud storage.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your records, receipts, and signature data are stored in the cloud and accessible across devices.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
