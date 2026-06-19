'use client';

import React, { useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboard-store';
import * as db from '@/lib/db';

// Layout
import Sidebar from '@/components/layout/Sidebar';
import MobileHeader from '@/components/layout/MobileHeader';
import StatusBanner from '@/components/layout/StatusBanner';
import LoadingScreen from '@/components/layout/LoadingScreen';

// Tab views
import DashboardTab from '@/components/dashboard/DashboardTab';
import LedgerTab from '@/components/ledger/LedgerTab';
import MeetingsTab from '@/components/meetings/MeetingsTab';
import LodgmentsTab from '@/components/lodgments/LodgmentsTab';
import ReconciliationTab from '@/components/reconciliation/ReconciliationTab';
import ReportsTab from '@/components/reports/ReportsTab';
import SettingsTab from '@/components/settings/SettingsTab';

// Modals
import TransactionModal from '@/components/modals/TransactionModal';
import MeetingModal from '@/components/modals/MeetingModal';
import LodgmentModal from '@/components/modals/LodgmentModal';
import StatementModal from '@/components/modals/StatementModal';
import ReceiptPreview from '@/components/modals/ReceiptPreview';

import AuthScreen from '@/components/AuthScreen';

export default function Home() {
  const {
    user, authBypass, loading, supabaseConnected, darkMode,
    setDarkMode, loadAllData, setAuthBypass, setUser, setAuthMode,
    activeTab, hydrated, setHydrated
  } = useDashboardStore();

  // Theme initialization from localStorage
  useEffect(() => {
    setHydrated();
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(savedTheme === 'dark' || (!savedTheme && prefersDark));
    }
  }, [setDarkMode, setHydrated]);

  // Theme sync to DOM
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Supabase Auth listener
  useEffect(() => {
    const configured = db.isSupabaseConfigured();
    if (configured) {
      db.initSupabase();
      const client = db.getSupabaseClient();
      if (client) {
        client.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null);
        });
        const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
          setUser(session?.user ?? null);
          if (event === 'PASSWORD_RECOVERY') {
            setAuthBypass(false);
            setAuthMode('update');
          }
        });
        return () => subscription.unsubscribe();
      }
    }
  }, [supabaseConnected, setUser, setAuthBypass, setAuthMode]);

  // Load data on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Auth guard (only after hydration — server can't read localStorage)
  if (hydrated && db.isSupabaseConfigured() && !user && !authBypass) {
    return <AuthScreen onSuccess={() => loadAllData()} onDemoMode={() => setAuthBypass(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 flex flex-col overflow-y-auto p-6 md:p-10 mt-16 md:mt-0">
        <StatusBanner />
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'ledger' && <LedgerTab />}
            {activeTab === 'meetings' && <MeetingsTab />}
            {activeTab === 'lodgments' && <LodgmentsTab />}
            {activeTab === 'reconciliation' && <ReconciliationTab />}
            {activeTab === 'reports' && <ReportsTab />}
            {activeTab === 'settings' && <SettingsTab />}
          </>
        )}
      </main>
      <TransactionModal />
      <MeetingModal />
      <LodgmentModal />
      <StatementModal />
      <ReceiptPreview />
    </div>
  );
}
