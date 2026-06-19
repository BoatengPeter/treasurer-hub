'use client';
import { useDashboardStore } from '@/stores/dashboard-store';
import {
  LayoutDashboard, FileSpreadsheet, Users, Building, ClipboardCheck,
  FileText, Settings, Sun, Moon, LogOut, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as db from '@/lib/db';

const navItems = [
  { tab: 'dashboard', label: 'Financial Position', icon: LayoutDashboard },
  { tab: 'ledger', label: 'Transactions Ledger', icon: FileSpreadsheet },
  { tab: 'meetings', label: 'Meeting Sign-offs', icon: Users },
  { tab: 'members', label: 'Member Roster', icon: UserCheck },
  { tab: 'lodgments', label: 'Church Lodgments', icon: Building },
  { tab: 'reconciliation', label: 'Reconciliation', icon: ClipboardCheck },
  { tab: 'reports', label: 'Accounts Reports', icon: FileText },
  { tab: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { activeTab, darkMode, supabaseConnected, user, setActiveTab, setDarkMode, handleLogOut } = useDashboardStore();
  return (
    <aside className="no-print hidden md:flex flex-col w-[280px] bg-card border-r border-border p-6 flex-shrink-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-600 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
          YT
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold leading-tight bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent">
            Treasurer Hub
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            Youth Accounts Portal
          </p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1.5">
        {navItems.map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === item.tab
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <item.icon className="h-4 w-4" /> {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-border pt-4 flex flex-col gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-center gap-2"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {darkMode ? 'Light Theme' : 'Dark Theme'}
        </Button>
        {db.isSupabaseConfigured() && user && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogOut}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </Button>
        )}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${supabaseConnected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`}></span>
          {supabaseConnected ? 'Supabase Connected' : 'Supabase Disconnected'}
        </div>
      </div>
    </aside>
  );
}
