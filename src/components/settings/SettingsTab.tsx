'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import { Database, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import * as db from '@/lib/db';

export default function SettingsTab() {
  const { dbSettings, settingsStatusMsg, handleSaveDbSettings, handleJsonImport, setDbSettings } = useDashboardStore();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Portal Settings</h2>
        <p className="text-xs text-muted-foreground">Setup Supabase endpoints or perform local data backups</p>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Database className="h-5 w-5 text-emerald-600" /> Supabase Connection</CardTitle>
            <CardDescription>Sync data in real-time to the cloud for multi-device access</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveDbSettings} className="flex flex-col gap-4">
              {settingsStatusMsg.text && (
                <div className={`p-3 rounded text-xs border ${settingsStatusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                  {settingsStatusMsg.text}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider">Supabase URL</label>
                <Input type="url" placeholder="https://your-project.supabase.co"
                  value={dbSettings.url} onChange={(e) => setDbSettings({ ...dbSettings, url: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider">Anon Public Key</label>
                <Input type="password" placeholder="eyJhbGciOiJIUzI1Ni..."
                  value={dbSettings.key} onChange={(e) => setDbSettings({ ...dbSettings, key: e.target.value })} />
              </div>
              <div className="flex justify-between items-center mt-3">
                <Button type="button" variant="ghost" size="sm" onClick={() => setDbSettings({ url: '', key: '' })}>Clear</Button>
                <Button type="submit">Connect & Sync</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Download className="h-5 w-5 text-emerald-600" /> Data Portability</CardTitle>
            <CardDescription>Export backups or restore records from JSON backup files</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <Button onClick={db.exportBackup} className="w-full flex items-center justify-center gap-2">
              <Download className="h-4 w-4" /> Download Backup File (.json)
            </Button>
            <div className="border-t border-border pt-4">
              <span className="text-xs font-semibold uppercase tracking-wider block mb-2">Restore Backup File</span>
              <Input type="file" accept=".json" onChange={handleJsonImport} className="text-xs" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
