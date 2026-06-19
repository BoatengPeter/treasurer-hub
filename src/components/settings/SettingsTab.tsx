'use client';
import { useState } from 'react';
import HelpButton from '@/components/ui/HelpButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, UserPlus, CheckCircle2 } from 'lucide-react';
import * as db from '@/lib/db';

export default function SettingsTab() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteError, setInviteError] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteMessage('');
    setInviteError('');
    setInviteLoading(true);

    try {
      const client = db.getSupabaseClient();
      if (!client) throw new Error('Supabase not connected');

      const session = await client.auth.getSession();
      const token = session.data.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to send invite');

      setInviteMessage(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">Portal Settings</h2>
          <HelpButton title="Portal Settings">
            <p>View the current connection status and general information about the application.</p>
            <p><strong>What you can do here:</strong></p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Check Supabase cloud connection status</li>
              <li>View data storage information</li>
              <li>Invite new leaders by email (they&apos;ll receive a link to set their password)</li>
            </ul>
          </HelpButton>
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite New Leader
          </CardTitle>
          <CardDescription>
            Send an invitation email so a leader can set their own password and access the portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="flex flex-col gap-4">
            {inviteMessage && (
              <div className="flex items-center gap-2 p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {inviteMessage}
              </div>
            )}
            {inviteError && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg">
                {inviteError}
              </div>
            )}
            <div className="flex gap-3 items-end">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="president@church.org"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <Button type="submit" disabled={inviteLoading}>
                {inviteLoading ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
