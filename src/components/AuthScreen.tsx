'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import * as db from '@/lib/db';

interface AuthScreenProps {
  onSuccess: () => void;
}

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'forgot' | 'update'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const getClient = () => {
    db.initSupabase();
    return db.getSupabaseClient();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const client = getClient();
    if (!client) {
      setError('Supabase is not configured. Check your environment variables.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signin') {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
      } else if (mode === 'forgot') {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}`,
        });
        if (error) throw error;
        setMessage('Password reset email sent. Please check your inbox!');
      } else if (mode === 'update') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        setMessage('Password updated successfully! You can now log in.');
        setMode('signin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden">

      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-3xl" />

      <Card className="w-full max-w-[450px] shadow-xl border-border z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
              YT
            </div>
          </div>
          <CardTitle className="font-heading text-2xl font-bold bg-gradient-to-r from-emerald-600 to-amber-500 bg-clip-text text-transparent">
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'update' && 'Update Password'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' && 'Authorised leaders only. Log in to access the treasurer hub.'}
            {mode === 'forgot' && 'Enter your email to request a reset link.'}
            {mode === 'update' && 'Enter your new password below.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleAuth} className="flex flex-col gap-4">

            {error && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-lg">
                {message}
              </div>
            )}

            {mode !== 'update' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="treasurer@church.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setMessage(''); setMode('forgot'); }}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
            )}

            {mode === 'update' && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-9"
                    />
                  </div>
                </div>
              </>
            )}

            <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 mt-2">
              {loading ? 'Processing...' : (
                <>
                  {mode === 'signin' && 'Log In'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  {mode === 'update' && 'Update Password'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          {(mode === 'forgot' || mode === 'update') && (
            <button
              type="button"
              onClick={() => { setError(''); setMessage(''); setMode('signin'); }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
            >
              <KeyRound className="h-3 w-3" /> Back to Log In
            </button>
          )}

          <div className="w-full border-t border-border/50 pt-3 flex justify-end items-center gap-2">
            <div className="flex items-center gap-1 text-[10px]">
              <Database className="h-3.5 w-3.5" />
              <span>TLS Secured</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
